"use client";

import { CheckCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useForm } from "@tanstack/react-form";
import { usePostHog } from "posthog-js/react";
import { useMutation } from "@tanstack/react-query";

export const TopPanel = () => {
  const posthog = usePostHog();
  const sendEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
  });
  const [stockMonitorSubscribeEmail, setStockMonitorSubscribeEmail] =
    useLocalStorage<string | undefined>("stock-monitor-subscribe");
  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const email = value.email;

      try {
        await sendEmailMutation.mutateAsync(email);
        setStockMonitorSubscribeEmail(email);
        posthog.identify(email);
      } catch (error) {
        console.error(error);
      }
    },
  });
  const shouldRenderForm = stockMonitorSubscribeEmail === undefined;

  return (
    <>
      {!shouldRenderForm && (
        <Alert className="mb-4 h-24 flex flex-col justify-center">
          <AlertTitle className="font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 -mt-0.5 text-green-600" size={32} />{" "}
            Subscribed!
          </AlertTitle>
          <AlertDescription>
            You&apos;re already subscribed with the email:{" "}
            {stockMonitorSubscribeEmail}.
          </AlertDescription>
        </Alert>
      )}

      {shouldRenderForm && (
        <Card className="mb-4 h-24">
          <CardContent className="h-full py-0 flex items-center w-full">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="flex flex-col w-full sm:flex-row gap-2"
            >
              <form.Field
                name="email"
                // @eslint-disable-next-line @react/no-children-prop
                children={(field) => (
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    className="flex-grow"
                  />
                )}
              />
              <Button
                type="submit"
                disabled={sendEmailMutation.isPending}
                className="w-64"
              >
                {sendEmailMutation.isPending ? (
                  <RefreshCcw className="animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
};
