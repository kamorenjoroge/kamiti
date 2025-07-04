// api/dashboard/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Tool from '../../../models/Tools';
import { Order } from '../../../models/Orders';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

interface ApiResponse {
  success: boolean;
  data: StatCard[];
  error?: string;
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    await dbConnect();

    // Get all data in parallel
    const [
      totalTools,
      totalOrders,
      totalRevenueAgg,
      activeUsersAgg,
      previousPeriodData
    ] = await Promise.all([
      Tool.countDocuments(),
      Order.countDocuments({ status: { $nin: ['pending', 'cancelled'] } }),
      Order.aggregate([
        { $match: { status: { $nin: ['pending', 'cancelled'] } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ['pending', 'cancelled'] } } },
        { $group: { _id: "$customerEmail" } },
        { $count: "activeUsers" }
      ]),
      // Previous 30 days data for comparison
      Order.aggregate([
        { 
          $match: { 
            status: { $nin: ['pending', 'cancelled'] },
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          } 
        },
        { 
          $facet: {
            previousOrders: [{ $count: "count" }],
            previousRevenue: [{ $group: { _id: null, total: { $sum: "$total" } } }],
            previousUsers: [{ $group: { _id: "$customerEmail" } }, { $count: "count" }]
          }
        }
      ])
    ]);

    // Extract values
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const activeUsers = activeUsersAgg[0]?.activeUsers || 0;

    // Previous period data
    const prevOrders = previousPeriodData[0]?.previousOrders[0]?.count || 0;
    const prevRevenue = previousPeriodData[0]?.previousRevenue[0]?.total || 0;
    const prevUsers = previousPeriodData[0]?.previousUsers[0]?.count || 0;
    const prevTools = Math.floor(totalTools * 0.9); // Mock previous tools count

    // Calculate changes
    const revenueChange = calculateChange(totalRevenue, prevRevenue);
    const ordersChange = calculateChange(totalOrders, prevOrders);
    const usersChange = calculateChange(activeUsers, prevUsers);
    const toolsChange = calculateChange(totalTools, prevTools);

    // Format stats cards
    const statsCards: StatCard[] = [
      {
        title: 'Total Revenue',
        value: `Kes ${totalRevenue.toLocaleString()}`,
        change: `${revenueChange.value}%`,
        trend: revenueChange.trend,
        icon: 'MdTrendingUp',
        color: revenueChange.trend === 'up' ? 'text-success' : 'text-danger'
      },
      {
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        change: `${ordersChange.value}%`,
        trend: ordersChange.trend,
        icon: 'MdShoppingCart',
        color: ordersChange.trend === 'up' ? 'text-info' : 'text-danger'
      },
      {
        title: 'Active Customers',
        value: activeUsers.toLocaleString(),
        change: `${usersChange.value}%`,
        trend: usersChange.trend,
        icon: 'MdPeople',
        color: usersChange.trend === 'up' ? 'text-warning' : 'text-danger'
      },
      {
        title: 'Available Tools',
        value: totalTools.toLocaleString(),
        change: `${toolsChange.value}%`,
        trend: toolsChange.trend,
        icon: 'MdInventory',
        color: toolsChange.trend === 'up' ? 'text-primary' : 'text-danger'
      }
    ];

    return NextResponse.json({ success: true, data: statsCards });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        data: [],
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Helper function for percentage change calculation
function calculateChange(
  current: number,
  previous: number
): { value: string; trend: 'up' | 'down' } {
  if (previous === 0) return { value: '100', trend: 'up' };

  const change = ((current - previous) / previous * 100).toFixed(1);
  const trend: 'up' | 'down' = Number(change) >= 0 ? 'up' : 'down';
  const value = trend === 'up' ? `+${change}` : change;

  return { value, trend };
}