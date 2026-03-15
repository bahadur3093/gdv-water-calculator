import { User } from "./user.model";
import { ApiError } from "../../utils/ApiError";
import { Villa } from "../villas/villa.model";

export const getUsers = async () => {
  const [users, villas] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    Villa.find({ isActive: true }, "villaNumber address residentId"),
  ]);

  const villaMap = new Map(
    villas.map((v) => [
      v.residentId?.toString(),
      { _id: v._id, villaNumber: v.villaNumber, address: v.address },
    ]),
  );

  return users.map((u) => ({
    ...u.toObject(),
    isAdmin: u.role === 'admin',
    villa: villaMap.get(u._id.toString()) || null,
  }));
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  villaId?: string;
  phone?: string;
}) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ApiError(409, "Email already in use");
  
  const user = await User.create(data);
  
  // If villaId is provided, update the villa's residentId and fetch villa details
  if (data.villaId) {
    await Villa.findByIdAndUpdate(data.villaId, { residentId: user._id });
    
    // Fetch the updated user with villa details
    const userWithVilla = await User.findById(user._id).lean();
    const villa = await Villa.findById(data.villaId, "villaNumber address").lean();
    
    return {
      ...userWithVilla,
      villa: villa ? {
        _id: villa._id,
        villaNumber: villa.villaNumber,
        address: villa.address
      } : null
    };
  }
  
  return { ...user.toObject(), villa: null };
};

export const updateUser = async (
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    villaId: string;
    isActive: boolean;
  }>,
) => {
  const currentUser = await User.findById(id);
  if (!currentUser) throw new ApiError(404, "User not found");
  
  // If villaId is being updated, handle villa resident assignment
  if (data.villaId !== undefined) {
    // Remove user from previous villa if exists
    if (currentUser.villaId) {
      await Villa.findByIdAndUpdate(currentUser.villaId, { $unset: { residentId: 1 } });
    }
    
    // Assign user to new villa if villaId is provided
    if (data.villaId) {
      await Villa.findByIdAndUpdate(data.villaId, { residentId: id });
    }
  }
  
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  
  if (!user) throw new ApiError(404, "User not found");
  
  // Fetch villa details if user has villaId
  if (user.villaId) {
    const villa = await Villa.findById(user.villaId, "villaNumber address").lean();
    return {
      ...user,
      villa: villa ? {
        _id: villa._id,
        villaNumber: villa.villaNumber,
        address: villa.address
      } : null
    };
  }
  
  return { ...user, villa: null };
};

export const deactivateUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
};
