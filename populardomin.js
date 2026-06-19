const { Chatango } = require('./ch');
const Bot = new Chatango();
const roomName = 'daddylivehd';

const domainCounts = new Map();

function normalizeDomain(domain) {
  return domain.toLowerCase();
}

function extractDomains(text) {
  if (!text) return [];
  const domains = [];
  const urlRegex = /\bhttps?:\/\/([^\s\/]+)(?:[^\s]*)/ig;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    domains.push(normalizeDomain(match[1]));
  }

  const domainRegex = /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})(?=\b|[\/:])/ig;
  while ((match = domainRegex.exec(text)) !== null) {
    domains.push(normalizeDomain(match[1]));
  }

  return domains;
}

function addMessageText(text) {
  for (const domain of extractDomains(text)) {
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
  }
}

function getTopDomain() {
  let top = null;
  for (const [domain, count] of domainCounts.entries()) {
    if (!top || count > top.count) {
      top = { domain, count };
    }
  }
  return top;
}

function printTopDomain() {
  const top = getTopDomain();
  if (top) {
    console.log(`Most popular domain so far: ${top.domain} (${top.count} mention${top.count !== 1 ? 's' : ''})`);
  } else {
    console.log('No domains found yet in chat history.');
  }
}

Bot.on('HistoryMessage', (room, user, message) => {
  if (room.name !== roomName) return;
  addMessageText(message.text);
});

Bot.easy_start('', '', [roomName]);
console.log(`Connecting to ${roomName} and waiting for history...`);

setTimeout(() => {
  const top = getTopDomain();
  if (top) {
    console.log(`${top.domain} ${top.count}`);
  } else {
    console.log('No domains found in chat history.');
  }

  for (const room of Object.values(Bot.rooms)) {
    room.disconnect();
  }
  if (Bot.PM) {
    Bot.PM.status = "not_ok";
    Bot.PM.disconnect();
  }

  process.exit(0);
}, 3000);
