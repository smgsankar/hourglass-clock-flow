import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { clamp, formatClock, formatSpokenTime, shouldAnnounceRemaining } from "./time.ts";

describe("clamp", () => {
  it("keeps values inside the range", () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-1, 0, 10), 0);
    assert.equal(clamp(99, 0, 10), 10);
  });
});

describe("formatClock", () => {
  it("pads minutes and seconds to two digits", () => {
    assert.equal(formatClock(0), "00:00");
    assert.equal(formatClock(9), "00:09");
    assert.equal(formatClock(60), "01:00");
    assert.equal(formatClock(325), "05:25");
    assert.equal(formatClock(5999), "99:59");
  });

  it("never renders a negative clock", () => {
    assert.equal(formatClock(-30), "00:00");
  });
});

describe("formatSpokenTime", () => {
  it("spells durations out so screen readers do not read MM:SS as a time of day", () => {
    assert.equal(formatSpokenTime(325), "5 minutes 25 seconds");
    assert.equal(formatSpokenTime(300), "5 minutes");
    assert.equal(formatSpokenTime(45), "45 seconds");
  });

  it("uses singular units", () => {
    assert.equal(formatSpokenTime(60), "1 minute");
    assert.equal(formatSpokenTime(61), "1 minute 1 second");
  });

  it("always says something, even at zero", () => {
    assert.equal(formatSpokenTime(0), "0 seconds");
    assert.equal(formatSpokenTime(-5), "0 seconds");
  });
});

describe("shouldAnnounceRemaining", () => {
  it("announces every whole minute", () => {
    assert.equal(shouldAnnounceRemaining(300), true);
    assert.equal(shouldAnnounceRemaining(60), true);
  });

  it("announces the 30 and 10 second marks", () => {
    assert.equal(shouldAnnounceRemaining(30), true);
    assert.equal(shouldAnnounceRemaining(10), true);
  });

  it("announces each of the final five seconds", () => {
    for (const seconds of [5, 4, 3, 2, 1]) {
      assert.equal(shouldAnnounceRemaining(seconds), true);
    }
  });

  it("stays quiet the rest of the time so the countdown is not read out every second", () => {
    for (const seconds of [299, 128, 59, 31, 29, 11, 9, 6]) {
      assert.equal(shouldAnnounceRemaining(seconds), false, `expected silence at ${seconds}s`);
    }
  });

  it("leaves the completion announcement to the alert region", () => {
    assert.equal(shouldAnnounceRemaining(0), false);
  });
});
