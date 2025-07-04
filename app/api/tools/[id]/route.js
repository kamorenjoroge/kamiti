// app/api/tools/[id]/route.js
import { NextResponse } from 'next/server';
import cloudinary from '../../../../lib/cloudinary';
import dbConnect from '../../../../lib/dbConnect';
import Tool from '../../../../models/Tools';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const tool = await Tool.findById(awaitedParams.id);
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: tool },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const formData = await request.formData();

    // Extract fields
    const name = formData.get('name');
    const brand = formData.get('brand');
    const category = formData.get('category');
    const quantity = parseInt(formData.get('quantity')) || 1;
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const color = formData.getAll('color');
    const existingImages = formData.getAll('existingImages');

    // Handle image uploads
    const imageFiles = formData.getAll('images');
    const imageUrls = [...existingImages];

    for (const file of imageFiles) {
      if (file.size === 0) continue;

      const buffer = await file.arrayBuffer();
      const array = new Uint8Array(buffer);

      const imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'tools' },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed: no result'));
              return;
            }
            resolve(result.secure_url);
          }
        ).end(array);
      });

      imageUrls.push(imageUrl);
    }

    const updatedTool = await Tool.findByIdAndUpdate(
      awaitedParams.id,
      {
        name,
        brand,
        category,
        quantity,
        description,
        price,
        color,
        image: imageUrls
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, data: updatedTool },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const tool = await Tool.findById(awaitedParams.id);
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    try {
      for (const imageUrl of tool.image) {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`tools/${publicId}`);
        }
      }
    } catch (cloudinaryError) {
      console.error('Error deleting images from Cloudinary:', cloudinaryError);
    }

    await Tool.findByIdAndDelete(awaitedParams.id);

    return NextResponse.json(
      { success: true, message: 'Tool deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}