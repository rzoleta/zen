# AGENTS.md

## Mobile builds (EAS)

"Create an {ios|android} {production|preview} build [and submit]". Run from `apps/mobile` and show the user the command first.

```bash
eas build --platform <ios|android> --profile <production|preview> --non-interactive
eas submit --platform <ios|android> --profile production --id <build-id> --non-interactive
```

- Run in the background and wait for it to finish. Report the build number and URLs.
- Only submit `production` builds. Take `<build-id>` from the build's logs URL.
- Don't pipe `eas` output through `grep`, since that hides failures.
- iOS submit is configured. Android has no `android.package` or submit config yet.
