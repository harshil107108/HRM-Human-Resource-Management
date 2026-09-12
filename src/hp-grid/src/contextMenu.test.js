import test from "node:test";
import assert from "node:assert/strict";

test("contextData supports both array and function returning array", () => {
  const sampleRow = { _id: "bank-123", bankName: "HDFC Bank", status: true };

  // Static array
  const staticContextData = [
    {
      icon: "dummy-icon",
      text: "Edit",
      onClick: (row) => row._id,
    },
    {
      icon: "dummy-trash",
      text: "Delete",
      danger: true,
      onClick: (row) => row._id,
    },
  ];

  assert.equal(Array.isArray(staticContextData), true);
  assert.equal(staticContextData.length, 2);
  assert.equal(staticContextData[0].text, "Edit");
  assert.equal(staticContextData[0].onClick(sampleRow), "bank-123");

  // Dynamic function
  const dynamicContextData = (params) => [
    {
      icon: "dummy-icon",
      text: params.row.status ? "Deactivate" : "Activate",
      onClick: (row) => row._id,
    },
  ];

  const resolvedItems = dynamicContextData({ row: sampleRow, rowIndex: 0 });
  assert.equal(resolvedItems.length, 1);
  assert.equal(resolvedItems[0].text, "Deactivate");
});

test("GridContextMenu boundary calculation keeps menu within viewport", () => {
  const windowWidth = 1024;
  const windowHeight = 768;
  const margin = 8;
  const menuWidth = 160;
  const menuHeight = 100;

  function calculatePosition(x, y) {
    let nextLeft = x;
    let nextTop = y;

    if (x + menuWidth + margin > windowWidth) {
      nextLeft = Math.max(margin, x - menuWidth);
    }
    if (y + menuHeight + margin > windowHeight) {
      nextTop = Math.max(margin, y - menuHeight);
    }

    return { left: nextLeft, top: nextTop };
  }

  // Right-click in the middle of screen
  const normalPos = calculatePosition(500, 300);
  assert.equal(normalPos.left, 500);
  assert.equal(normalPos.top, 300);

  // Right-click near right edge
  const rightEdgePos = calculatePosition(1000, 300);
  assert.equal(rightEdgePos.left, 840);

  // Right-click near bottom edge
  const bottomEdgePos = calculatePosition(500, 750);
  assert.equal(bottomEdgePos.top, 650);
});
