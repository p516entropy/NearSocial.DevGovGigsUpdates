/*
---props---
currentCode: string,
prevCode?: string,

findUniqueResult(
  lineCountDeleted: number, 
  lineCountInserted: inserted,
  lineCountCurrentCode: number,
  lineCountPrevCode: number,
  allLineCount: number
)?: function

addStyle?: Object,
deleteStyle?: Object

showLineNumber?: bool

*/

if (typeof props?.currentCode !== "string") return "send {currentCode: string} in props";

const MAX_CHARS_PER_LINE = 120;

function formatText(markdownString) {
  const lines = markdownString.split("\n");
  const formattedLines = [];
  for (let line of lines) {
    if (line.length <= MAX_CHARS_PER_LINE) {
      formattedLines.push(line);
      continue;
    }
    let splitIndex = MAX_CHARS_PER_LINE;
    while (splitIndex > 0 && line.charAt(splitIndex) !== " ") {
      splitIndex--;
    }
    if (splitIndex === 0) {
      formattedLines.push(line.substring(0, MAX_CHARS_PER_LINE));
      line = line.substring(MAX_CHARS_PER_LINE);
    } else {
      formattedLines.push(line.substring(0, splitIndex));
      line = line.substring(splitIndex + 1);
    }
    while (line.length > MAX_CHARS_PER_LINE) {
      splitIndex = MAX_CHARS_PER_LINE;
      while (splitIndex > 0 && line.charAt(splitIndex) !== " ") {
        splitIndex--;
      }
      if (splitIndex === 0) {
        formattedLines.push(line.substring(0, MAX_CHARS_PER_LINE));
        line = line.substring(MAX_CHARS_PER_LINE);
      } else {
        formattedLines.push(line.substring(0, splitIndex));
        line = line.substring(splitIndex + 1);
      }
    }
    formattedLines.push(line);
  }
  return formattedLines.join("\n");
}

const modifiedCurrentCode = formatText(props.currentCode);
const modifiedPrevCode = formatText(props.prevCode);
//code from this - https://github.com/jonTrent/PatienceDiff
function patienceDiff(aLines, bLines, diffPlusFlag) {
  function findUnique(arr, lo, hi) {
    const lineMap = new Map();

    for (let i = lo; i <= hi; i++) {
      let line = arr[i];

      if (lineMap.has(line)) {
        lineMap.get(line).count++;
        lineMap.get(line).index = i;
      } else {
        lineMap.set(line, {
          count: 1,
          index: i,
        });
      }
    }

    lineMap.forEach((val, key) => {
      if (val.count !== 1) {
        lineMap.delete(key);
      } else {
        lineMap.set(key, val.index);
      }
    });

    return lineMap;
  }

  function uniqueCommon(aArray, aLo, aHi, bArray, bLo, bHi) {
    const ma = findUnique(aArray, aLo, aHi);
    const mb = findUnique(bArray, bLo, bHi);

    ma.forEach((val, key) => {
      if (mb.has(key)) {
        ma.set(key, {
          indexA: val,
          indexB: mb.get(key),
        });
      } else {
        ma.delete(key);
      }
    });

    return ma;
  }

  function longestCommonSubsequence(abMap) {
    const ja = [];

    abMap.forEach((val, key, map) => {
      let i = 0;

      while (ja[i] && ja[i][ja[i].length - 1].indexB < val.indexB) {
        i++;
      }

      if (!ja[i]) {
        ja[i] = [];
      }

      if (0 < i) {
        val.prev = ja[i - 1][ja[i - 1].length - 1];
      }

      ja[i].push(val);
    });

    let lcs = [];

    if (0 < ja.length) {
      let n = ja.length - 1;
      lcs = [ja[n][ja[n].length - 1]];

      while (lcs[lcs.length - 1].prev) {
        lcs.push(lcs[lcs.length - 1].prev);
      }
    }

    return lcs.reverse();
  }

  const result = [];
  let deleted = 0;
  let inserted = 0;

  const aMove = [];
  const aMoveIndex = [];
  const bMove = [];
  const bMoveIndex = [];

  function addToResult(aIndex, bIndex) {
    if (bIndex < 0) {
      aMove.push(aLines[aIndex]);
      aMoveIndex.push(result.length);
      deleted++;
    } else if (aIndex < 0) {
      bMove.push(bLines[bIndex]);
      bMoveIndex.push(result.length);
      inserted++;
    }

    result.push({
      line: 0 <= aIndex ? aLines[aIndex] : bLines[bIndex],
      aIndex: aIndex,
      bIndex: bIndex,
    });
  }

  function addSubMatch(aLo, aHi, bLo, bHi) {
    while (aLo <= aHi && bLo <= bHi && aLines[aLo] === bLines[bLo]) {
      addToResult(aLo++, bLo++);
    }

    let aHiTemp = aHi;

    while (aLo <= aHi && bLo <= bHi && aLines[aHi] === bLines[bHi]) {
      aHi--;
      bHi--;
    }

    const uniqueCommonMap = uniqueCommon(aLines, aLo, aHi, bLines, bLo, bHi);

    if (uniqueCommonMap.size === 0) {
      while (aLo <= aHi) {
        addToResult(aLo++, -1);
      }

      while (bLo <= bHi) {
        addToResult(-1, bLo++);
      }
    } else {
      recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap);
    }

    while (aHi < aHiTemp) {
      addToResult(++aHi, ++bHi);
    }
  }

  function recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap) {
    const x = longestCommonSubsequence(
      uniqueCommonMap || uniqueCommon(aLines, aLo, aHi, bLines, bLo, bHi)
    );

    if (x.length === 0) {
      addSubMatch(aLo, aHi, bLo, bHi);
    } else {
      if (aLo < x[0].indexA || bLo < x[0].indexB) {
        addSubMatch(aLo, x[0].indexA - 1, bLo, x[0].indexB - 1);
      }

      let i = 0;
      for (; i < x.length - 1; i++) {
        addSubMatch(x[i].indexA, x[i + 1].indexA - 1, x[i].indexB, x[i + 1].indexB - 1);
      }

      if (x[i].indexA <= aHi || x[i].indexB <= bHi) {
        addSubMatch(x[i].indexA, aHi, x[i].indexB, bHi);
      }
    }
  }

  recurseLCS(0, aLines.length - 1, 0, bLines.length - 1);

  if (diffPlusFlag) {
    return {
      lines: result,
      lineCountDeleted: deleted,
      lineCountInserted: inserted,
      lineCountMoved: 0,
      aMove: aMove,
      aMoveIndex: aMoveIndex,
      bMove: bMove,
      bMoveIndex: bMoveIndex,
    };
  }

  return {
    lines: result,
    lineCountDeleted: deleted,
    lineCountInserted: inserted,
    lineCountMoved: 0,
  };
}

const diffResult = patienceDiff(
  modifiedPrevCode ? modifiedPrevCode.split(/\r\n|\n/) : [],
  modifiedCurrentCode.split(/\r\n|\n/)
);

if (props.findUniqueResult)
  props.findUniqueResult(
    diffResult.lineCountDeleted,
    diffResult.lineCountInserted,
    modifiedCurrentCode.split(/\r\n|\n/).length,
    modifiedPrevCode ? modifiedPrevCode.split(/\r\n|\n/).length : 0,
    diffResult.lines.length
  );

let longestLineLength = 0;
diffResult.lines.forEach((line) => {
  if (line.line.length > longestLineLength) longestLineLength = line.line.length;
});

const linePropsDesktop = (lineNumber) => {
  const line = diffResult.lines[lineNumber - 1];
  let conditionalTopMargin = "0";
  let conditionalBottomMargin = "0";
  if (lineNumber === 1) {
    conditionalTopMargin = "-1em";
  } else if (lineNumber === diffResult.lines.length) conditionalBottomMargin = "-1em";

  let style = {
    display: "block",
    width: "auto",
    background: "#fff",
    marginRight: `-1em`,
    marginLeft: "-1em",
    marginTop: conditionalTopMargin,
    marginBottom: conditionalBottomMargin,
    paddingLeft: "1em",
    color: "black",
  };

  if (line.aIndex === -1 || line.bIndex === -1) {
    style = {
      ...style,
    };
  }

  if (line.aIndex === -1) {
    style = {
      ...style,
      background: "#E0FFEC",
      ...props.addStyle,
    };
  }
  if (line.bIndex === -1) {
    style = {
      ...style,
      background: "#FFEDF0",
      ...props.deleteStyle,
    };
  }
  return { style };
};

const linePropsMobile = (lineNumber) => {
  const line = diffResult.lines[lineNumber - 1];
  let conditionalTopMargin = "0";
  let conditionalBottomMargin = "0";
  if (lineNumber === 1) {
    conditionalTopMargin = "-1em";
  } else if (lineNumber === diffResult.lines.length) conditionalBottomMargin = "-1em";

  let style = {
    display: "block",
    width: "auto",
    background: "#fff",
    marginRight: `-${parseInt(longestLineLength * 0.5)}em`,
    marginLeft: "-1em",
    marginTop: conditionalTopMargin,
    marginBottom: conditionalBottomMargin,
    paddingLeft: "1em",
    color: "black",
  };

  if (line.aIndex === -1 || line.bIndex === -1) {
    style = {
      ...style,
    };
  }

  if (line.aIndex === -1) {
    style = {
      ...style,
      background: "#E0FFEC",
      ...props.addStyle,
    };
  }
  if (line.bIndex === -1) {
    style = {
      ...style,
      background: "#FFEDF0",
      ...props.deleteStyle,
    };
  }
  return { style };
};

const codeText = diffResult.lines.map((el) => el.line).join("\n");

const ShowOnDesktop = styled.div`
  display: none;

  @media (min-width: 1200px) {
    display: block;
  }
`;

const ShowOnMobile = styled.div`
  display: none;

  @media (max-width: 1200px) {
    display: block;
  }
`;

return (
  <>
    <ShowOnDesktop>
      <Markdown
        text={`
\`\`\`\text
${codeText}
`}
        syntaxHighlighterProps={{
          wrapLines: true,
          lineProps: linePropsDesktop,
          showLineNumbers: true,
          lineNumberStyle: { display: !props.showLineNumber && "none" },
        }}
      />
    </ShowOnDesktop>
    <ShowOnMobile>
      <Markdown
        text={`
\`\`\`\text
${codeText}
`}
        syntaxHighlighterProps={{
          wrapLines: true,
          lineProps: linePropsMobile,
          showLineNumbers: true,
          lineNumberStyle: { display: !props.showLineNumber && "none" },
        }}
      />
    </ShowOnMobile>
  </>
);
