import { cn } from "@/lib/cn";

describe("cn", () => {
  test("lets the study count override default text styles", () => {
    expect(
      cn(
        "font-sans text-base text-foreground",
        "font-sans-semibold text-8xl tracking-tighter",
      ),
    ).toBe("text-foreground font-sans-semibold text-8xl tracking-tighter");
  });

  test("lets explicit sizes override heading variants", () => {
    expect(
      cn(
        "font-sans text-base text-foreground",
        "font-sans-semibold text-4xl tracking-tight",
        "text-2xl",
      ),
    ).toBe("text-foreground font-sans-semibold tracking-tight text-2xl");
  });

  test("preserves independent styles and ignores absent classes", () => {
    expect(
      cn("text-base text-foreground", false, undefined, null, "text-muted-foreground"),
    ).toBe("text-base text-muted-foreground");
  });
});
