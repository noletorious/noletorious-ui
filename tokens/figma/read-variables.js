// Run in Figma with the MCP `use_figma` tool (Plugin API) to read every color variable.
// Save the result as tokens/figma/snapshot.json under "collections", update "readAt",
// then run `npm run tokens:figma-diff`.
//
// Output shape: { [collection]: { [variable]: aliasName | [r, g, b] } }
// Aliases come back as the target variable's name (e.g. "blue/53"); raw colors as 0-255 RGB.
const cols = await figma.variables.getLocalVariableCollectionsAsync()
const vars = await figma.variables.getLocalVariablesAsync('COLOR')
const byId = Object.fromEntries(vars.map((v) => [v.id, v]))
const out = {}
for (const c of cols) {
  const mode = c.modes[0].modeId
  out[c.name] = Object.fromEntries(
    vars
      .filter((v) => v.variableCollectionId === c.id)
      .map((v) => {
        const val = v.valuesByMode[mode]
        if (val.type === 'VARIABLE_ALIAS') return [v.name, byId[val.id].name]
        return [v.name, [val.r, val.g, val.b].map((x) => Math.round(x * 255))]
      })
  )
}
return out
