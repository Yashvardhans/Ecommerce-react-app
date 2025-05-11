import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  // Get redirect path from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo === "checkout" ? "/checkout" : redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        navigate(redirectTo === "checkout" ? "/checkout" : redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | ShopWorld</title>
        <meta name="description" content="Login to your ShopWorld account to access your orders, wishlist and more." />
        <meta property="og:title" content="Login | ShopWorld" />
        <meta property="og:description" content="Login to your ShopWorld account to access your orders, wishlist and more." />
      </Helmet>

      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your username and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                href={redirectTo !== "/" ? `/register?redirect=${redirectTo}` : "/register"}
                className="text-primary hover:underline"
              >
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Login;
