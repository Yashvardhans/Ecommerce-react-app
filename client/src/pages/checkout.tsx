import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  shippingAddress: z.string().min(1, { message: "Shipping address is required" }),
  shippingCity: z.string().min(1, { message: "City is required" }),
  shippingState: z.string().min(1, { message: "State is required" }),
  shippingZipCode: z.string().min(1, { message: "ZIP code is required" }),
  shippingCountry: z.string().min(1, { message: "Country is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login?redirect=checkout");
      } else if (cartItems.length === 0) {
        navigate("/products");
        toast({
          title: "Empty Cart",
          description: "Your cart is empty. Add some products first.",
          variant: "destructive",
        });
      }
    }
  }, [isAuthenticated, authLoading, cartItems.length, navigate, toast]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      shippingAddress: user?.address || "",
      shippingCity: user?.city || "",
      shippingState: user?.state || "",
      shippingZipCode: user?.zipCode || "",
      shippingCountry: user?.country || "",
      paymentMethod: "credit_card",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        shippingAddress: user.address || "",
        shippingCity: user.city || "",
        shippingState: user.state || "",
        shippingZipCode: user.zipCode || "",
        shippingCountry: user.country || "",
        paymentMethod: "credit_card",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order items array from cart items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Create the order
      const orderData = {
        ...values,
        total: cartTotal.toString(),
        orderItems,
      };

      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();

      // Clear the cart after successful order
      clearCart();

      // Show success message
      toast({
        title: "Order Successful",
        description: `Your order #${order.id} has been placed successfully!`,
      });

      // Redirect to order confirmation page
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate order summary
  const subtotal = cartTotal;
  const shipping = 0; // Free shipping
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax
  const total = subtotal + shipping + tax;

  if (authLoading || !isAuthenticated || cartItems.length === 0) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | ShopWorld</title>
        <meta name="description" content="Complete your purchase on ShopWorld. Secure checkout for your online shopping." />
        <meta property="og:title" content="Checkout | ShopWorld" />
        <meta property="og:description" content="Complete your purchase on ShopWorld. Secure checkout for your online shopping." />
      </Helmet>

      <div className="container py-12">
        <h1 className="text-3xl font-bold font-heading mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  Enter your shipping details for delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="shippingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                              >
                                <div className="flex items-center space-x-2 border p-3 rounded-md">
                                  <RadioGroupItem value="credit_card" id="credit_card" />
                                  <FormLabel htmlFor="credit_card" className="cursor-pointer">
                                    <div className="flex items-center gap-2">
                                      <i className="far fa-credit-card"></i>
                                      <span>Credit Card</span>
                                    </div>
                                  </FormLabel>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded-md">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <FormLabel htmlFor="paypal" className="cursor-pointer">
                                    <div className="flex items-center gap-2">
                                      <i className="fab fa-paypal"></i>
                                      <span>PayPal</span>
                                    </div>
                                  </FormLabel>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit button is below in the Order Summary section */}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Review your order before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-start gap-2">
                        <div className="bg-neutral-lightest w-12 h-12 rounded-md flex-shrink-0 overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-neutral-dark">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-secondary">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <div className="text-center text-xs text-neutral-dark mt-2">
                  By placing your order, you agree to our{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
