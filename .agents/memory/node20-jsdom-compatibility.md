---
name: Node 20 test DOM compatibility
description: Records the test-environment compatibility constraint between this project, Replit's Node runtime, and jsdom.
---

Use a Node 20-compatible jsdom release for this project's Vitest environment; jsdom 30 caused worker startup failures in the current Replit Node 20 runtime.

**Why:** The jsdom 30 dependency chain loaded an Undici WebIDL API unavailable in this runtime, so no unit tests could start even though type checking and builds succeeded.

**How to apply:** Keep jsdom on the compatible 26.x line while the project runs on Node 20. Re-evaluate the pin only when upgrading the Replit Node runtime and rerun the full unit suite.