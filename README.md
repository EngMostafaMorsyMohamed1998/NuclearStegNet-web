# NuclearStegNet — Web Demo (static)

**Live site:** https://engmostafamorsymohamed1998.github.io/NuclearStegNet-web/

Static GitHub Pages build of the NuclearStegNet web app: image steganalysis for robotic telemetry
(SRM filter bank + SE-attention simulator) and a multi-robot inspection mission simulation.

- **Home:** https://engmostafamorsymohamed1998.github.io/NuclearStegNet-web/
- **Analyze an image:** https://engmostafamorsymohamed1998.github.io/NuclearStegNet-web/analyze.html
- **Mission simulation:** https://engmostafamorsymohamed1998.github.io/NuclearStegNet-web/mission.html

All computation (SRM filtering, SE scoring, metrics, ROC, sanitizing, robot frames, AES-256-GCM link via WebCrypto)
runs client-side in your browser (`static/sim.js`); no image is uploaded anywhere. English by default, Arabic via the toggle.

> Research simulator: the detector uses fixed, untrained weights, and the dashboard metrics
> (balanced accuracy / TPR / FPR / ROC) are simulated reference values, not measured results.
