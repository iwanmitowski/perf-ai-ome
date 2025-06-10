import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
];

export default function ScentProfileQuiz({ initialAnswers = {}, onComplete }) {
  const [step, setStep] = useState(1);
  const [vibe, setVibe] = useState(initialAnswers.vibe || "");
  const [scene, setScene] = useState(initialAnswers.scene || "");
  const [elements, setElements] = useState(initialAnswers.elements || []);
  const [loved, setLoved] = useState(initialAnswers.loved || "");
  const [disliked, setDisliked] = useState(initialAnswers.disliked || "");
  const [sillage, setSillage] = useState(
    initialAnswers.sillage || "ModerateSillage"
  );
  const [longevity, setLongevity] = useState(
    initialAnswers.longevity || "ModerateLongevity"
  );
  const [additional, setAdditional] = useState(initialAnswers.additional || "");

  useEffect(() => {
    setVibe(initialAnswers.vibe || "");
    setScene(initialAnswers.scene || "");
    setElements(initialAnswers.elements || []);
    setLoved(initialAnswers.loved || "");
    setDisliked(initialAnswers.disliked || "");
    setSillage(initialAnswers.sillage || "ModerateSillage");
    setLongevity(initialAnswers.longevity || "ModerateLongevity");
    setAdditional(initialAnswers.additional || "");
  }, [initialAnswers]);

  const toggleElement = (val) => {
    setElements((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    const payload = {
      vibe,
      scene,
      elements,
      loved,
      disliked,
      sillage,
      longevity,
      additional,
    };
    try {
      await axios.post(
        "http://localhost:8088/user/user-123/scent-profile",
        payload
      );
      alert("Saved!");
      if (onComplete) {
        onComplete(payload);
      }
      setStep(1);
    } catch (e) {
      alert("Failed to save", e.message);
    }
  };

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="p-4 space-y-6">
      <div className="h-2 bg-muted rounded-full">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: progress + "%" }}
        />
      </div>
      <p className="text-sm text-muted-foreground text-right">
        Step {step} of 4
      </p>
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            What's the primary mood you want your fragrance to create?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {vibeOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setVibe(o.value)}
                className={`border rounded-lg p-4 flex flex-col items-center ${vibe === o.value ? "bg-primary text-primary-foreground" : ""}`}
              >
                <span className="text-3xl">{o.icon}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!vibe}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Your ideal scent transports you to...
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {sceneOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setScene(o.value)}
                className={`border rounded-lg p-4 flex flex-col items-center ${scene === o.value ? "bg-primary text-primary-foreground" : ""}`}
              >
                <span className="text-3xl">{o.icon}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!scene}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Which of these smells do you naturally enjoy?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {elementOptions.map((o) => (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={elements.includes(o.value)}
                  onChange={() => toggleElement(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={elements.length === 0}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Tell us more</h2>
          <div className="space-y-2">
            <label className="block">
              What fragrances do you currently love?
            </label>
            <Input value={loved} onChange={(e) => setLoved(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="block">Any fragrances you've disliked?</label>
            <Input
              value={disliked}
              onChange={(e) => setDisliked(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block">Sillage Preference</label>
            <select
              value={sillage}
              onChange={(e) => setSillage(e.target.value)}
              className="border rounded-md p-2"
            >
              <option value="BeastModeSillage">BeastModeSillage</option>
              <option value="ModerateSillage">ModerateSillage</option>
              <option value="StrongSillage">StrongSillage</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block">Longevity Preference</label>
            <select
              value={longevity}
              onChange={(e) => setLongevity(e.target.value)}
              className="border rounded-md p-2"
            >
              <option value="ShortLongevity">ShortLongevity</option>
              <option value="ModerateLongevity">ModerateLongevity</option>
              <option value="LongLongevity">LongLongevity</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block">Anything else we should know?</label>
            <Input
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      )}
    </div>
  );
}
