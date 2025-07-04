// app/api/tools/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '../../../lib/cloudinary';
import dbConnect from '../../../lib/dbConnect';
import Tool from '../../../models/Tools';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Extract text fields
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const color = formData.getAll('color') as string[];

    // Validate required fields
    if (!name || !brand || !category || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    const existingImages = formData.getAll('existingImages') as string[];
    const imageUrls: string[] = [...existingImages];

    for (const file of imageFiles) {
      if (file.size === 0) continue;

      const buffer = await file.arrayBuffer();
      const array = new Uint8Array(buffer);

      const imageUrl = await new Promise<string>((resolve, reject) => {
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

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    const tool = await Tool.create({
      name,
      brand,
      category,
      quantity,
      description,
      price,
      color,
      image: imageUrls,
    });

    return NextResponse.json({ success: true, data: tool }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const tools = await Tool.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tools }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
