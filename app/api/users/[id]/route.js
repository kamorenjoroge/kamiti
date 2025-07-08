import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const userId = params.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          __v: user.__v
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const userId = params.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
        deletedData: {
          _id: user._id,
          email: user.email,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
