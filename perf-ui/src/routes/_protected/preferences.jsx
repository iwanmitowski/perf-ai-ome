import { useEffect, useState } from "react";
import axios from "axios";
import ScentProfileQuiz from "@/components/preferences/ScentProfileQuiz";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/preferences")({
  loader: async () => {
    try {
      const res = await axios.get(
        "http://localhost:8088/user/user-123/scent-profile"
      );
      return res.data.profile;
    } catch {
      return null;
    }
  },
  component: Preferences,
});

function Preferences() {
  const profile = Route.useLoaderData();
  const [quizAnswers, setQuizAnswers] = useState(profile);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    setQuizAnswers(profile);
  }, [profile]);

  return (
    <div className="space-y-8 p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Core Profile</CardTitle>
          <CardDescription>
            This is your foundational scent profile. Retake the quiz anytime to
            update it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quizAnswers ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {quizAnswers.vibe?.replace("_", " & ")}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {quizAnswers.scene}
                </Badge>
                {quizAnswers.elements?.map((el) => (
                  <Badge key={el} variant="outline" className="capitalize">
                    {el}
                  </Badge>
                ))}
              </div>
              {quizAnswers.loved && (
                <p className="text-sm">
                  <span className="font-semibold">Loved:</span>{" "}
                  {quizAnswers.loved}
                </p>
              )}
              {quizAnswers.disliked && (
                <p className="text-sm">
                  <span className="font-semibold">Disliked:</span>{" "}
                  {quizAnswers.disliked}
                </p>
              )}
              <p className="text-sm">
                <span className="font-semibold">Sillage:</span>{" "}
                {quizAnswers.sillage}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Longevity:</span>{" "}
                {quizAnswers.longevity}
              </p>
              {quizAnswers.additional && (
                <p className="text-sm whitespace-pre-line">
                  <span className="font-semibold">Notes:</span>{" "}
                  {quizAnswers.additional}
                </p>
              )}
            </div>
          ) : (
            <p>You haven't completed the scent quiz yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsQuizOpen(true)}>
            {quizAnswers ? "Retake Scent Quiz" : "Take Scent Quiz"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="overflow-auto">
          <DialogHeader>
            <DialogTitle>Scent Quiz</DialogTitle>
          </DialogHeader>
          <ScentProfileQuiz
            initialAnswers={quizAnswers || {}}
            onComplete={(ans) => {
              setQuizAnswers(ans);
              setIsQuizOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
