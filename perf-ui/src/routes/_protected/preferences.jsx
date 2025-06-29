import { useEffect, useState } from "react";
import axios from "axios";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import ScentProfileQuiz from "@/components/preferences/ScentProfileQuiz";
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
import { Input } from "@/components/ui/input";

import { Wand2, Dna, FlaskConical, Heart, HeartOff, Link } from "lucide-react";
import { toast } from "sonner";

const sillageLabels = {
  BeastModeSillage: "Soft",
  ModerateSillage: "Moderate",
  StrongSillage: "Strong",
};

const longevityLabels = {
  ShortLongevity: "Intimate",
  ModerateLongevity: "Moderate",
  LongLongevity: "Long-Lasting",
};

export const Route = createFileRoute("/_protected/preferences")({
  component: Preferences,
});

function Preferences() {
  const { user } = useAuth0();
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [logValue, setLogValue] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:8088/user/${user.sub}/scent-profile`
        );
        setQuizAnswers(res.data.profile);
      } catch {
        setQuizAnswers(null);
      }
    };
    fetchProfile();
  }, [user]);

  const navigate = useNavigate();

  const handleLog = async (field) => {
    if (!logValue) return;
    const updated = {
      ...quizAnswers,
      [field]: quizAnswers[field]
        ? `${quizAnswers[field]}, ${logValue}`
        : logValue,
    };
    try {
      await axios.post(
        `http://localhost:8088/user/${user?.sub}/scent-profile`,
        updated
      );
      toast.success("Saved", { description: `Logged as ${field}` });
      setQuizAnswers(updated);
      setLogValue("");
    } catch (e) {
      toast.error("Failed", {
        description: `Could not save: ${e.message}`,
      });
    }
  };

  if (!quizAnswers) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
          <Dna className="w-16 h-16 mb-4 text-primary" />
          <h1 className="text-2xl font-bold">Discover Your Scent DNA</h1>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md">
            Take our quick quiz to build your personal scent profile. We'll use
            it to find fragrances you'll love.
          </p>
          <Button size="lg" onClick={() => setIsQuizOpen(true)}>
            Take the Scent Quiz
          </Button>
        </div>

        <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Your Scent Profile Quiz</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-2">
              <ScentProfileQuiz
                initialAnswers={{}}
                onComplete={(ans) => {
                  setQuizAnswers(ans);
                  setIsQuizOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Scent Profile
          </h1>
          <p className="text-muted-foreground">
            A living dashboard of your fragrance preferences. Refine it anytime.
          </p>
        </div>
        <Button onClick={() => setIsQuizOpen(true)}>Retake Full Quiz</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Let our AI analyze your Scent Genome to reveal your perfect
              fragrance matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Ready to find your next signature scent? Let our AI do the work.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/",
                })
              }
            >
              Explore The World Of Scents
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="w-5 h-5" />
              Scent DNA
            </CardTitle>
            <CardDescription>
              The core of your taste, based on your quiz answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Vibe & Scene</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {quizAnswers.vibe?.replace("_", " & ")}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {quizAnswers.scene}
                </Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Favorite Elements</h4>
              <div className="flex flex-wrap gap-2">
                {quizAnswers.elements?.map((el) => (
                  <Badge key={el} variant="outline" className="capitalize">
                    {el}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Performance Profile
            </CardTitle>
            <CardDescription>
              How you like your fragrances to perform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Sillage (Projection):</span>
              <Badge variant="default">
                {sillageLabels[quizAnswers.sillage] || quizAnswers.sillage}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Longevity (Duration):</span>
              <Badge variant="default">
                {longevityLabels[quizAnswers.longevity] ||
                  quizAnswers.longevity}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Fragrance Wardrobe</CardTitle>
            <CardDescription>
              Log scents you've tried to fine-tune your recommendations. The
              more you add, the smarter our AI gets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-500" />
                Loved Scents
              </h4>
              <p className="text-muted-foreground text-sm">
                {quizAnswers.loved || "Log a scent you love to get started."}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <HeartOff className="w-4 h-4 text-red-500" />
                Disliked Scents
              </h4>
              <p className="text-muted-foreground text-sm">
                {quizAnswers.disliked ||
                  "Log a scent you dislike to help us avoid them."}
              </p>
            </div>
            {quizAnswers.additional && (
              <div className="space-y-2">
                <h4 className="font-semibold">Additional Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {quizAnswers.additional}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Enter a fragrance name..."
              className="flex-grow"
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleLog("loved")}
                disabled={!logValue}
              >
                Log as Loved
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleLog("disliked")}
                disabled={!logValue}
              >
                Log as Disliked
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Your Scent Profile Quiz</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <ScentProfileQuiz
              initialAnswers={quizAnswers || {}}
              onComplete={(ans) => {
                setQuizAnswers(ans);
                setIsQuizOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
