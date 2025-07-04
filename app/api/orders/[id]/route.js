// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { Order } from '../../../../models/Orders';

// GET single order by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const { id } = awaitedParams;
    
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: order 
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE order status by ID
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const awaitedParams = await params;
    const { id } = awaitedParams;
    const { status } = await request.json();

    // Validate ID
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Validate the status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'shipped', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status value',
          validStatuses: validStatuses 
        },
        { status: 400 }
      );
    }

    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date() // Explicitly update the timestamp
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedOrder 
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}