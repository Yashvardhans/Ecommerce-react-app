import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().min(1, { message: "ZIP code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AddressFormValues = z.infer<typeof addressSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login?redirect=profile");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      country: user?.country || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      
      addressForm.reset({
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "",
      });
    }
  }, [user, profileForm, addressForm]);

  const onSubmitProfile = async (values: ProfileFormValues) => {
    await updateProfile(values);
  };

  const onSubmitAddress = async (values: AddressFormValues) => {
    await updateProfile(values);
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    await updateProfile(values);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile | ShopWorld</title>
        <meta name="description" content="View and update your profile information on ShopWorld." />
        <meta property="og:title" content="My Profile | ShopWorld" />
        <meta property="og:description" content="View and update your profile information on ShopWorld." />
      </Helmet>

      <div className="container py-12">
        <h1 className="text-3xl font-bold font-heading mb-6">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted w-full justify-start border-b">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
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
                        control={profileForm.control}
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
                        control={profileForm.control}
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
                        control={profileForm.control}
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

                    <div className="flex justify-end">
                      <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                        {profileForm.formState.isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>
                  Update your shipping address for faster checkout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(onSubmitAddress)} className="space-y-6">
                    <FormField
                      control={addressForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={addressForm.control}
                        name="city"
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
                        control={addressForm.control}
                        name="state"
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
                        control={addressForm.control}
                        name="zipCode"
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
                        control={addressForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={addressForm.formState.isSubmitting}>
                        {addressForm.formState.isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Saving...
                          </>
                        ) : (
                          "Save Address"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Separator className="my-4" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Order History</h2>
              <p className="text-neutral-dark">View and track your orders</p>
            </div>
            <Button asChild>
              <a href="/orders">View Orders</a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
