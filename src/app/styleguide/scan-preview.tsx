"use client";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { ScanFlow, CameraFrame } from "@/components/scan/scan-flow";
import { FaceMap } from "@/components/scan/face-map";
import {
  SCAN_TITLES,
  SCAN_ERRORS,
  UNAVAILABLE_COPY,
} from "@/components/scan/scan-copy";
import { sampleProfile } from "@/lib/skin/samples";
import { summarizeProfile } from "@/lib/skin/goals";
import { SAMPLES } from "@/app/_store/scan-controller";
import type {
  SampleFaceId,
  ScanStep,
  ScanErrorCode,
  ScanUnavailableReason,
} from "@/types/scan";
export function ScanPreview() {
  const [screen, setScreen] = useState("intro");
  const [consent, setConsent] = useState(false);
  const [sample, setSample] = useState<SampleFaceId>("oily");
  const [notice, setNotice] = useState("");
  const [stepPart, code] = screen.split(":");
  const step = stepPart as ScanStep;
  return (
    <section className="section">
      <Container>
        <h2 className="type-h2 mb-6">Scan components</h2>
        <section id="scan-camera" className="mb-12">
          <h3 className="type-h3 mb-6">Camera frame · Ready & countdown</h3>
          <div className="scan-specimen">
            <CameraFrame
              checks={{
                hasFace: true,
                position: true,
                frontal: true,
                lighting: true,
              }}
              countdown={3}
              cameraReady
              cameraSlot={<FaceMap />}
              onCapture={() => setNotice("Capture callback")}
            />
          </div>
        </section>
        <section id="scan-flow">
          <h3 className="type-h3 mb-6">Scan flow · Every screen</h3>
          <p className="mb-6">
            Fixture specimens. Use the selector for every error and unavailable
            reason. Test the complete modal with a Scan my skin button on any
            route.
          </p>
          <label className="field-label mb-6">
            Scan screen
            <select
              className="select-control"
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
            >
              {Object.entries(SCAN_TITLES)
                .filter(([key]) => key !== "error" && key !== "unavailable")
                .map(([key, title]) => (
                  <option key={key} value={key}>
                    {title}
                  </option>
                ))}
              <option value="preview:camera">Camera preview & retake</option>
              {Object.entries(SCAN_ERRORS).map(([key, { title }]) => (
                <option key={key} value={`error:${key}`}>
                  Error · {title}
                </option>
              ))}
              {Object.keys(UNAVAILABLE_COPY).map((key) => (
                <option key={key} value={`unavailable:${key}`}>
                  Unavailable · {key.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <div className="scan-specimen">
            <h3 className="type-h3 mb-6">{SCAN_TITLES[step]}</h3>
            <ScanFlow
              key={screen}
              step={step}
              consent={consent}
              onConsentChange={setConsent}
              samples={SAMPLES}
              photo={step === "reveal" ? undefined : `/samples/${sample}.jpg`}
              photoAlt="AI-generated face used for this component specimen"
              photoSource={code === "camera" ? "camera" : "upload"}
              result={sampleProfile(sample)}
              summary={summarizeProfile(sampleProfile(sample))}
              checks={{
                hasFace: false,
                position: false,
                frontal: false,
                lighting: false,
              }}
              analysisStage={2}
              error={(code ?? "no_face") as ScanErrorCode}
              unavailableReason={(code ?? "daily_cap") as ScanUnavailableReason}
              onStepChange={setScreen}
              onSelectSample={(id) => {
                setSample(id);
                setScreen("reveal");
              }}
              onUpload={() => setNotice("Upload callback")}
              onCapture={() => setNotice("Capture callback")}
              onUsePhoto={() => setScreen("reveal")}
              onContinue={(enabled) =>
                setNotice(
                  `Continue with recommendations ${enabled ? "on" : "off"}`,
                )
              }
              onClose={() => setNotice("Close callback")}
              revisiting
            />
          </div>
        </section>
        <p role="status" className="type-small mt-6">
          {notice}
        </p>
      </Container>
    </section>
  );
}
