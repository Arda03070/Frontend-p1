export const TYPE_LABELS = {
  normal: 'Normaal',
  fire: 'Vuur',
  water: 'Water',
  electric: 'Elektrisch',
  grass: 'Gras',
  ice: 'IJs',
  fighting: 'Vecht',
  poison: 'Gif',
  ground: 'Grond',
  flying: 'Vlieg',
  psychic: 'Psycho',
  bug: 'Insect',
  rock: 'Steen',
  ghost: 'Geest',
  dragon: 'Draak',
  dark: 'Duister',
  steel: 'Staal',
  fairy: 'Fee',
}

export function formatTypes(types) {
  return types.map((type) => TYPE_LABELS[type] || type).join(' / ')
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
