import type { ITorNode } from '../types/tor.types';

/**
 * Automatically computes the next sequential ToR code based on parent and sibling nodes.
 * Examples:
 * - Root: "1", "2", "3"...
 * - Sub-ToR under "1": "1.1", "1.2", "1.3"...
 * - Sub-ToR under "1.0": "1.1", "1.2"...
 * - Sub-ToR under "2": "2.1", "2.2"...
 */
export function generateNextTorCode(
  parentId: string | null | undefined,
  flatNodes: ITorNode[] = []
): string {
  const nodes = flatNodes || [];
  if (!parentId) {
    const rootNodes = nodes.filter((n) => !n.parentId);
    if (rootNodes.length === 0) return '1';

    let maxNum = 0;
    rootNodes.forEach((n) => {
      const num = parseInt(n.code, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });

    return String(maxNum > 0 ? maxNum + 1 : rootNodes.length + 1);
  }

  const parent = nodes.find((n) => n.id === parentId);
  if (!parent || !parent.code) return '1.1';

  const parentCode = parent.code.trim();
  const parentBase = parentCode.endsWith('.0') ? parentCode.slice(0, -2) : parentCode;

  const children = nodes.filter((n) => n.parentId === parentId);
  if (children.length === 0) {
    return `${parentBase}.1`;
  }

  let maxChildIndex = 0;
  const prefix = `${parentBase}.`;

  children.forEach((c) => {
    if (c.code && c.code.startsWith(prefix)) {
      const remainder = c.code.slice(prefix.length).split('.')[0];
      const parsed = parseInt(remainder, 10);
      if (!isNaN(parsed) && parsed > maxChildIndex) {
        maxChildIndex = parsed;
      }
    } else if (c.code) {
      const parts = c.code.split('.');
      const last = parts[parts.length - 1];
      const parsed = parseInt(last, 10);
      if (!isNaN(parsed) && parsed > maxChildIndex) {
        maxChildIndex = parsed;
      }
    }
  });

  return `${parentBase}.${maxChildIndex + 1}`;
}
