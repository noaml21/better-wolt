import { fireEvent, render, screen } from '@testing-library/react';
import Button from './Button';

/* A loading button stands in for "disabled" without the attribute, so it
   keeps focus. What must not change is the reason it exists: a second
   press — a click, or Enter in a field — does not submit again. */

test('a loading button keeps focus and ignores presses', () => {
  const onClick = jest.fn();

  render(
    <Button loading onClick={onClick}>
      שמירה
    </Button>
  );

  const button = screen.getByRole('button');
  button.focus();
  fireEvent.click(button);

  expect(onClick).not.toHaveBeenCalled();
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute('aria-disabled', 'true');
});

test('a loading submit button does not submit its form again', () => {
  const onSubmit = jest.fn((event) => event.preventDefault());

  render(
    <form onSubmit={onSubmit}>
      <input aria-label="שם" />
      <Button type="submit" loading>
        שמירה
      </Button>
    </form>
  );

  fireEvent.click(screen.getByRole('button'));

  expect(onSubmit).not.toHaveBeenCalled();
});
