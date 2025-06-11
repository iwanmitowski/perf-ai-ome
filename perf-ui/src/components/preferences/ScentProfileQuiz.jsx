import { useReducer, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const vibeOptions = [
  { value: "energizing", label: "Energizing & Fresh", icon: "⚡" },
  { value: "alluring", label: "Alluring & Mysterious", icon: "🌙" },
  { value: "cozy", label: "Cozy & Comforting", icon: "🧣" },
  { value: "elegant", label: "Elegant & Sophisticated", icon: "🌹" },
];

const sceneOptions = [
  { value: "coastal", label: "A Coastal Escape", icon: "🏖️" },
  { value: "library", label: "A Quiet, Warm Room", icon: "📚" },
  { value: "garden", label: "A Lush Garden", icon: "🌳" },
  { value: "bakery", label: "A Sweet Indulgence", icon: "🍰" },
];

const elementOptions = [
  { value: "citrus", label: "Fresh fruits" },
  { value: "floral", label: "Fresh bouquet" },
  { value: "spicy", label: "Spices & woods" },
  { value: "gourmand", label: "Vanilla & sugar" },
  { value: "aquatic", label: "Ocean air" },
  { value: "green", label: "Leaves & stems" },
  { value: "smoky", label: "Incense & smoke" },
];

const longevityOptions = [
  {
    value: "ShortLongevity",
    label: "Intimate",
    description: "Lasts 1-3 hours. A fleeting experience.",
  },
  {
    value: "ModerateLongevity",
    label: "Moderate",
    description: "Lasts 4-6 hours. Perfect for a workday.",
  },
  {
    value: "LongLongevity",
    label: "Long-Lasting",
    description: "Lasts 7+ hours. Stays with you all day.",
  },
];

const sillageOptions = [
  {
    value: "ModerateSillage",
    label: "Soft",
    description: "Stays very close to the skin.",
  },
  {
    value: "StrongSillage",
    label: "Moderate",
    description: "Creates a pleasant scent bubble around you.",
  },
  {
    value: "BeastModeSillage",
    label: "Strong",
    description: "Fills a room and leaves a trail.",
  },
];

const initialState = {
  step: 1,
  vibe: "",
  scene: "",
  elements: [],
  loved: "",
  disliked: "",
  sillage: "ModerateSillage",
  longevity: "ModerateLongevity",
  additional: "",
  isSubmitting: false,
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.payload };
    case "TOGGLE_ELEMENT": {
      const elements = state.elements.includes(action.payload)
        ? state.elements.filter((e) => e !== action.payload)
        : [...state.elements, action.payload];
      return { ...state, elements };
    }
    case "INITIALIZE":
      return { ...initialState, ...action.payload, step: 1 };
    case "SUBMIT":
      return { ...state, isSubmitting: true };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false };
    case "SUBMIT_FAILURE":
      return { ...state, isSubmitting: false };
    default:
      throw new Error();
  }
}

const TOTAL_STEPS = 6;

export default function ScentProfileQuiz({ initialAnswers = {}, onComplete }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    dispatch({ type: "INITIALIZE", payload: initialAnswers });
  }, [initialAnswers]);

  const handleSubmit = async () => {
    dispatch({ type: "SUBMIT" });
    // eslint-disable-next-line no-unused-vars
    const { step, isSubmitting, ...payload } = state;
    try {
      await axios.post(
        "http://localhost:8088/user/user-666/scent-profile",
        payload
      );
      toast.success("Profile Saved!", {
        description: "We've updated your scent preferences.",
      });
      dispatch({ type: "SUBMIT_SUCCESS" });
      if (onComplete) {
        onComplete(payload);
      }
    } catch (e) {
      toast.error("Save Failed", {
        description:
          "Could not save your profile. Please try again." + e.message,
      });
      dispatch({ type: "SUBMIT_FAILURE" });
    }
  };

  const progress = ((state.step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="p-1">
      <div className="mb-6">
        <div className="h-2 bg-muted rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-right mt-2">
          Step {state.step} of {TOTAL_STEPS}
        </p>
      </div>

      <div className="transition-opacity duration-300">
        {state.step === 1 && (
          <StepCard title="What's the primary mood you want your fragrance to create?">
            <div className="grid grid-cols-2 gap-4">
              {vibeOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "vibe",
                      payload: o.value,
                    })
                  }
                  className={`border rounded-lg p-4 text-center transition-colors ${state.vibe === o.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                >
                  <span className="text-3xl block mb-2">{o.icon}</span>
                  <span className="font-medium">{o.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => dispatch({ type: "SET_STEP", payload: 2 })}
                disabled={!state.vibe}
              >
                Next
              </Button>
            </div>
          </StepCard>
        )}

        {state.step === 2 && (
          <StepCard title="Your ideal scent transports you to...">
            <div className="grid grid-cols-2 gap-4">
              {sceneOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "scene",
                      payload: o.value,
                    })
                  }
                  className={`border rounded-lg p-4 text-center transition-colors ${state.scene === o.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                >
                  <span className="text-3xl block mb-2">{o.icon}</span>
                  <span className="font-medium">{o.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "SET_STEP", payload: 1 })}
              >
                Back
              </Button>
              <Button
                onClick={() => dispatch({ type: "SET_STEP", payload: 3 })}
                disabled={!state.scene}
              >
                Next
              </Button>
            </div>
          </StepCard>
        )}

        {state.step === 3 && (
          <StepCard title="Which of these smells do you naturally enjoy?">
            <p className="text-muted-foreground text-sm mb-4">
              Select all that apply.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {elementOptions.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors ${state.elements.includes(o.value) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                >
                  <Checkbox
                    id={o.value}
                    checked={state.elements.includes(o.value)}
                    onCheckedChange={() =>
                      dispatch({ type: "TOGGLE_ELEMENT", payload: o.value })
                    }
                  />
                  <span className="font-medium">{o.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "SET_STEP", payload: 2 })}
              >
                Back
              </Button>
              <Button
                onClick={() => dispatch({ type: "SET_STEP", payload: 4 })}
                disabled={state.elements.length === 0}
              >
                Next
              </Button>
            </div>
          </StepCard>
        )}

        {state.step === 4 && (
          <StepCard title="How long do you want your scent to last?">
            <RadioGroup
              value={state.longevity}
              onValueChange={(val) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "longevity",
                  payload: val,
                })
              }
              className="space-y-3"
            >
              {longevityOptions.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center gap-4 border rounded-lg p-4 cursor-pointer has-[input:checked]:bg-muted has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value={o.value} id={`longevity-${o.value}`} />
                  <div>
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "SET_STEP", payload: 3 })}
              >
                Back
              </Button>
              <Button
                onClick={() => dispatch({ type: "SET_STEP", payload: 5 })}
              >
                Next
              </Button>
            </div>
          </StepCard>
        )}

        {state.step === 5 && (
          <StepCard title="How much should your scent project?">
            <RadioGroup
              value={state.sillage}
              onValueChange={(val) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "sillage",
                  payload: val,
                })
              }
              className="space-y-3"
            >
              {sillageOptions.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center gap-4 border rounded-lg p-4 cursor-pointer has-[input:checked]:bg-muted has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value={o.value} id={`sillage-${o.value}`} />
                  <div>
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "SET_STEP", payload: 4 })}
              >
                Back
              </Button>
              <Button
                onClick={() => dispatch({ type: "SET_STEP", payload: 6 })}
              >
                Next
              </Button>
            </div>
          </StepCard>
        )}

        {state.step === 6 && (
          <StepCard title="Finally, any specifics?">
            <div className="space-y-4">
              <div>
                <label htmlFor="loved" className="font-medium text-sm">
                  What fragrances do you currently love?
                </label>
                <Input
                  id="loved"
                  value={state.loved}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "loved",
                      payload: e.target.value,
                    })
                  }
                  placeholder="e.g., 1 Million Elixir"
                />
              </div>
              <div>
                <label htmlFor="disliked" className="font-medium text-sm">
                  Any fragrances you've disliked?
                </label>
                <Input
                  id="disliked"
                  value={state.disliked}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "disliked",
                      payload: e.target.value,
                    })
                  }
                  placeholder="e.g., Anything too sweet"
                />
              </div>
              <div>
                <label htmlFor="additional" className="font-medium text-sm">
                  Anything else we should know?
                </label>
                <Textarea
                  id="additional"
                  value={state.additional}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "additional",
                      payload: e.target.value,
                    })
                  }
                  placeholder="e.g., I'm allergic to Rose..."
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "SET_STEP", payload: 5 })}
              >
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={state.isSubmitting}>
                {state.isSubmitting ? "Saving..." : "Submit Profile"}
              </Button>
            </div>
          </StepCard>
        )}
      </div>
    </div>
  );
}

function StepCard({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
