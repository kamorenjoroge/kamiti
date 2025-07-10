// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const { id } = awaitedParams;

    const user = await User.findById(id);
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
        details: error.stack || null
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const { id } = awaitedParams;
    const body = await request.json();

    if (!body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        email: body.email,
        role: body.role,
        active: body.active !== undefined ? body.active : existingUser.active,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: updatedUser._id,
          email: updatedUser.email,
          role: updatedUser.role,
          active: updatedUser.active,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          __v: updatedUser.__v
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: error.stack || null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const { id } = awaitedParams;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

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
        details: error.stack || null
      },
      { status: 500 }
    );
  }
}