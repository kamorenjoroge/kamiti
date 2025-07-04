// app/api/Categorys/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Category from '../../../../models/Category';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const category = await Category.findById(awaitedParams.id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          _id: category._id,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          __v: category.__v
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching category:', error);
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
    const awaitedParams = await params;
    const category = await Category.findById(awaitedParams.id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(awaitedParams.id);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Category deleted successfully',
        deletedData: {
          _id: category._id,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
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