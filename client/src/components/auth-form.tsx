import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { authTokenSchema } from "@/lib/schema-validators";

// Form schema
const formSchema = z.object({
  token: authTokenSchema,
  remember: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  serverUrl: string;
  onAuthenticate: (token: string, remember: boolean) => void;
  onCancel: () => void;
}

export function AuthForm({ serverUrl, onAuthenticate, onCancel }: AuthFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      remember: false,
    },
  });

  const handleSubmit = (values: FormValues) => {
    onAuthenticate(values.token, values.remember);
  };

  return (
    <Card className="max-w-md w-full">
      <CardContent className="pt-6 space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {serverUrl} requires authentication
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key or Bearer Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your token"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember this token</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-1/2" disabled={form.formState.isSubmitting}>
                Authenticate
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
