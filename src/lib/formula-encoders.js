const encoders = {
  string(isLinkable, str) {
    return isLinkable
      ? `"${str.replace(/"/g, '"&char(34)&"')}"`
      : str;
  },

  bool(isLinkable, b) {
    return isLinkable
      ? (!!b ? 'true' : 'false')
      : b;
  },

  int(isLinkable, i) {
    return isLinkable
      ? '' + i
      : i;
  }
};

const decoders = {
  string(isLinkable, formula) {
    return isLinkable
      ? ('' + formula).replace(/"&char\(34\)&"/g, '"').replace(/^"/, '').replace(/"$/, '')
      : formula;
  },

  bool(isLinkable, formula) {
    return isLinkable
      ? ('' + formula).toLowerCase() === 'true'
      : formula;
  },

  int(isLinkable, formula) {
    return isLinkable
      ? parseInt('' + formula, 10)
      : formula
  }
}

export {
  encoders,
  decoders
};
