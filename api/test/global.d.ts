declare module globalThis {
  // It needs to be var https://stackoverflow.com/questions/68481686/type-typeof-globalthis-has-no-index-signature#answer-69230938
  // eslint-disable-next-line no-var
  var testRandomSeeds: Map<string, string>;
}
