import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to format order status
const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
    case "shipped":
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Shipped</Badge>;
    case "delivered":
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const OrderDetails = ({ orderId }: { orderId: number }) => {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!orderDetails || !orderDetails.items) {
    return <p className="text-neutral-dark">Order details not available</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Order Items</h3>
      <div className="space-y-2">
        {orderDetails.items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-light rounded-md overflow-hidden">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-neutral-dark">
                  ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                </p>
              </div>
            </div>
            <p className="font-medium">
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>${parseFloat(orderDetails.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${parseFloat(orderDetails.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
        <p>
          {orderDetails.shippingAddress}, {orderDetails.shippingCity},{" "}
          {orderDetails.shippingState} {orderDetails.shippingZipCode},{" "}
          {orderDetails.shippingCountry}
        </p>
      </div>
    </div>
  );
};

const Orders = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=orders");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders | ShopWorld</title>
        <meta name="description" content="View and track your orders on ShopWorld. Check order status and details." />
        <meta property="og:title" content="My Orders | ShopWorld" />
        <meta property="og:description" content="View and track your orders on ShopWorld. Check order status and details." />
      </Helmet>

      <div className="container py-12">
        <h1 className="text-3xl font-bold font-heading mb-6">My Orders</h1>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-6 w-1/6" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Orders Found</CardTitle>
              <CardDescription>
                You haven't placed any orders yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-neutral-dark mb-4">
                  Start shopping to place your first order!
                </p>
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View and track all your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {order.createdAt
                          ? format(new Date(order.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>${parseFloat(order.total).toFixed(2)}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {orders.length > 0 && (
          <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-bold font-heading">Recent Order Details</h2>
            <Card>
              <CardHeader>
                <CardTitle>Order #{orders[0].id}</CardTitle>
                <CardDescription>
                  Placed on{" "}
                  {orders[0].createdAt
                    ? format(new Date(orders[0].createdAt), "MMMM d, yyyy")
                    : "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderDetails orderId={orders[0].id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
