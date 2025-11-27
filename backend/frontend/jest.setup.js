// Testing Library matchers
import '@testing-library/jest-dom';

// Ensure fetch is available in jsdom tests
import 'whatwg-fetch';

// Optional: polyfill TextEncoder/TextDecoder for some libs when running in jsdom
import { TextEncoder, TextDecoder } from 'util';
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// Ensure Response.json static exists for NextResponse.json in jsdom
if (typeof global.Response !== 'undefined' && !global.Response.json) {
  const R = global.Response;
  R.json = (data, init = {}) => new R(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

// Mock lucide-react icons to avoid transforming ESM node_modules
jest.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: () => (props) => React.createElement('svg', props),
    }
  );
});

// Light mock for @radix-ui/react-accordion primitives used by our Accordion wrapper
jest.mock('@radix-ui/react-accordion', () => {
  const React = require('react');
  const Comp = (tag) => React.forwardRef((props, ref) => React.createElement(tag, { ref, ...props }));
  return {
    __esModule: true,
    Root: Comp('div'),
    Item: Comp('div'),
    Header: Comp('div'),
    Trigger: Comp('button'),
    Content: Comp('div'),
  };
});

// Mock radio-group primitives to enable value selection in tests
jest.mock('@radix-ui/react-radio-group', () => {
  const React = require('react');
  const Root = ({ children, onValueChange, ...props }) => {
    const handleWrap = (child) => {
      if (!child || typeof child !== 'object') return child;
      const onClick = () => onValueChange && onValueChange(child.props?.value?.toString?.() ?? child.props?.value);
      return React.cloneElement(child, { onClick });
    };
    return React.createElement('div', { ...props }, React.Children.map(children, handleWrap));
  };
  const Item = React.forwardRef((props, ref) => React.createElement('button', { ref, type: 'button', ...props }));
  const Indicator = React.forwardRef((props, ref) => React.createElement('span', { ref, ...props }));
  return { __esModule: true, Root, Item, Indicator };
});
