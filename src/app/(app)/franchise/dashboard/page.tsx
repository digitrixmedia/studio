
'use client';

import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, BarChart3, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";

import { ManageOutletDialog } from "@/components/franchise/ManageOutletDialog";

import type { FranchiseOutlet, SubscriptionStatus } from "@/lib/types";


const salesChartConfig = {
  total: { label: "Total Sales", color: "hsl(var(--primary))" },
  today: { label: "Today's Sales", color: "hsl(var(--chart-2))" },
};

const trendChartConfig = {
  sales: { label: "Sales", color: "hsl(var(--primary))" },
};

export default function FranchiseDashboardPage() {
  const { pastOrders, selectOutlet, outlets, auth, firestore } = useAppContext();

  const summary = useMemo(() => {
    const totalSales = outlets.reduce((sum, o) => sum + (o.totalSales || 0), 0);
    const todaySales = outlets.reduce((sum, o) => sum + (o.todaySales || 0), 0);
    const totalOrders = outlets.reduce((sum, o) => sum + (o.ordersToday || 0), 0);

    const sorted = [...outlets].sort((a, b) => (b.todaySales || 0) - (a.todaySales || 0));

    return {
      totalSales,
      todaySales,
      totalOrders,
      activeOutlets: outlets.filter((o) => o.status === "active").length,
      inactiveOutlets: outlets.filter((o) => o.status !== "active").length,
      topPerformer: sorted[0] || { name: "N/A", todaySales: 0 },
      lowPerformer: sorted[sorted.length - 1] || { name: "N/A", todaySales: 0 },
      avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    };
  }, [outlets]);

  const salesPerOutlet = useMemo(
    () =>
      outlets.map((o) => ({
        name: o.name,
        total: o.totalSales || 0,
        today: o.todaySales || 0,
      })),
    [outlets]
  );

  const salesTrend = useMemo(() => {
    const trend = (pastOrders || []).reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const orderDate = (order.createdAt as any).toDate ? (order.createdAt as any).toDate() : new Date(order.createdAt);

      const day = orderDate.toISOString().split("T")[0];
      acc[day] = (acc[day] || 0) + order.total;

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trend)
      .map(([day, sales]) => ({ day, sales }))
      .slice(-7);
  }, [pastOrders]);

  const [selectedOutlet, setSelectedOutlet] = useState<FranchiseOutlet | null>(null);

  const getStatusVariant = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "expired":
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (outlets.length === 0) {
    return (
      <div className="flex flex-col gap-8 text-center items-center justify-center h-full">
        <h1 className="text-3xl font-bold">Franchise Dashboard</h1>
        <p className="text-muted-foreground">
          No outlets found. Please contact Super Admin.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Franchise Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Sales</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <IndianRupee className="h-6 w-6 mr-1" />
                {summary.totalSales.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Today's Sales</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <IndianRupee className="h-6 w-6 mr-1" />
                {summary.todaySales.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Active Outlets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeOutlets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Inactive Outlets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.inactiveOutlets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Per Outlet</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="min-h-[300px]">
                <BarChart data={salesPerOutlet}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" />
                  <Bar dataKey="today" fill="var(--color-today)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="min-h-[300px]">
                <LineChart data={salesTrend}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Outlets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Outlets Overview</CardTitle>
            <CardDescription>Manage and view your outlets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Today's Sales</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Orders Today</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {outlets.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell>{outlet.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(outlet.status)}>
                        {outlet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{outlet.todaySales || 0}</TableCell>
                    <TableCell>{outlet.totalSales || 0}</TableCell>
                    <TableCell>{outlet.ordersToday || 0}</TableCell>
                    <TableCell>{outlet.managerName}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2"
                        onClick={() => setSelectedOutlet(outlet)}>
                        Manage
                      </Button>
                      <Button size="sm" onClick={() => selectOutlet(outlet)}>
                        Open POS
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedOutlet && (
        <ManageOutletDialog
          outlet={selectedOutlet}
          isOpen={!!selectedOutlet}
          onClose={() => setSelectedOutlet(null)}
          auth={auth}
          firestore={firestore}
        />
      )}
    </>
  );
}
