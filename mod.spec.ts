Deno.test("mod should be importable", async () => {
  // Arrange / Act / Assert
  await import("./mod.ts");
});
