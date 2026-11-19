import { hasValidCitations } from './citations';

const messages = [
  { id: 'm1', text: 'The customer asked for a delivery update.' },
  { id: 'm2', text: 'Support confirmed that the order is in transit.' },
];

const openTicket = document.querySelector<HTMLButtonElement>('#open-ticket')!;
const ticket = document.querySelector<HTMLElement>('#ticket')!;
const messageList = document.querySelector<HTMLUListElement>('#messages')!;
const generate = document.querySelector<HTMLButtonElement>('#generate')!;
const approve = document.querySelector<HTMLButtonElement>('#approve')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const summary = document.querySelector<HTMLParagraphElement>('#summary')!;

for (const message of messages) {
  const item = document.createElement('li');
  item.textContent = message.text;
  messageList.append(item);
}

openTicket.addEventListener('click', () => {
  ticket.hidden = !ticket.hidden;
  openTicket.setAttribute('aria-expanded', String(!ticket.hidden));
});

generate.addEventListener('click', async () => {
  generate.disabled = true;
  generate.textContent = 'Generate summary';
  approve.disabled = true;
  summary.hidden = true;
  summary.textContent = '';
  status.textContent = 'Generating summary...';

  try {
    const response = await fetch('/api/summary.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Summary service unavailable');
    }

    const result = await response.json();
    if (result?.status === 'insufficient_information') {
      status.textContent = 'Insufficient information to generate a summary.';
      return;
    }
    if (result?.status !== 'ok' || typeof result.summary !== 'string') {
      throw new Error('Unexpected summary response');
    }

    summary.textContent = result.summary;
    summary.hidden = false;
    const citationsValid = hasValidCitations(result.sourceIds, messages);
    approve.disabled = !citationsValid;
    status.textContent = citationsValid
      ? 'Summary ready for approval.'
      : 'Summary citations are missing or invalid.';
  } catch {
    status.textContent = 'Summary generation failed. Try again.';
    generate.textContent = 'Retry generation';
  } finally {
    generate.disabled = false;
  }
});

approve.addEventListener('click', () => {
  approve.disabled = true;
  status.textContent = 'Summary approved.';
});
