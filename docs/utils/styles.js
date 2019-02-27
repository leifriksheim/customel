export function padding({ p, pl, pt, pb, pr, py, px }) {
  return `
    padding-left: ${(p || px || pl) * 7 + "px"};
    padding-right: ${(p || px || pr) * 7 + "px"};
    padding-top: ${(p || py || pt) * 7 + "px"};
    padding-bottom: ${(p || py || pb) * 7 + "px"};
`;
}

export function margin({ m, ml, mt, mb, mr, my, mx }) {
  return `
    margin-left: ${(m || mx || ml) * 7 + "px"};
    margin-right: ${(m || mx || mr) * 7 + "px"};
    margin-top: ${(m || my || mt) * 7 + "px"};
    margin-bottom: ${(m || my || mb) * 7 + "px"};
`;
}

export function flex({
  justifyContent = "auto",
  alignItems = "auto",
  flexDirection = "column"
}) {
  return `
    display: flex;
    flex-direction: ${flexDirection};
    justify-content: ${justifyContent};
    align-items: ${alignItems};
`;
}
