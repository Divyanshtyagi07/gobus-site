const users = [
  { id: 1, name: 'Admin', email: 'admin@gobus.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'D.Pal Driver', email: 'driver@gobus.com', password: 'driveok', role: 'driver', phone: '9876538827' }
];

let bookings = [];
let buses = [];
let currSession = null;
let selectionRoute = null;

const BANK_DETAILS = `Pay to UPI: <b>yourbank@upi</b><br/>A/C No.: <b>9876543210</b> (Divyansh Tyagi)<br/>IFSC: <b>SBIN0000123</b>`;

const routeCoordinates = {
  'Delhi → Jaipur': [[28.6139, 77.2090], [26.9124, 75.7873]],
  'Delhi → Agra': [[28.6139, 77.2090], [27.1767, 78.0081]],
  'Noida → Jaipur': [[28.5355, 77.3910], [26.9124, 75.7873]],
  'Noida → Agra': [[28.5355, 77.3910], [27.1767, 78.0081]],
  'Agra → Delhi': [[27.1767, 78.0081], [28.6139, 77.2090]],
  'Agra → Lucknow': [[27.1767, 78.0081], [26.8467, 80.9462]],
  'Lucknow → Delhi': [[26.8467, 80.9462], [28.6139, 77.2090]],
  'Kanpur → Delhi': [[26.4499, 80.3319], [28.6139, 77.2090]],
  'Delhi → Lucknow': [[28.6139, 77.2090], [26.8467, 80.9462]],
  'Jaipur → Delhi': [[26.9124, 75.7873], [28.6139, 77.2090]],
  'Jaipur → Agra': [[26.9124, 75.7873], [27.1767, 78.0081]],
  'Bhopal → Delhi': [[23.2599, 77.4126], [28.6139, 77.2090]],
  'Chandigarh → Delhi': [[30.7333, 76.7794], [28.6139, 77.2090]],
  'Gwalior → Delhi': [[26.2183, 78.1828], [28.6139, 77.2090]]
};

const busPics = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1455656678494-4d1d13c8d6c5?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=650&q=80'
];

const routeTemplates = [
  ['Delhi', 'Jaipur'],
  ['Delhi', 'Agra'],
  ['Noida', 'Jaipur'],
  ['Noida', 'Agra'],
  ['Agra', 'Delhi'],
  ['Agra', 'Lucknow'],
  ['Lucknow', 'Delhi'],
  ['Kanpur', 'Delhi'],
  ['Delhi', 'Lucknow'],
  ['Jaipur', 'Delhi'],
  ['Jaipur', 'Agra'],
  ['Bhopal', 'Delhi'],
  ['Chandigarh', 'Delhi'],
  ['Gwalior', 'Delhi']
];

const startCities = ['Delhi', 'Noida', 'Agra', 'Lucknow', 'Kanpur', 'Bhopal', 'Chandigarh', 'Gwalior'];
const endCities = ['Jaipur', 'Agra', 'Kanpur', 'Delhi', 'Indore', 'Lucknow', 'Jammu'];

function buildDemoBuses() {
  buses = routeTemplates.map((route, index) => {
    const [from, to] = route;
    const price = 390 + ((index * 73) % 420);
    const seats = 32 + (index % 8);
    const seatMap = Array(seats).fill(0).map((_, j) => (j < ((index + 2) % 7) ? 1 : 0));
    return {
      id: index + 1,
      route: `${from} → ${to}`,
      busNum: `GB${110 + index}`,
      operator: ['MetroLink', 'CityKing', 'Rainbow', 'BlueLine', 'GoBus Pvt Ltd'][index % 5],
      departure: `${String(7 + (index * 2) % 10).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')}`,
      price,
      driver: index <= 2 ? 2 : null,
      img: busPics[index % busPics.length],
      seats,
      seatsLeft: Math.max(8, Math.floor(seats * 0.62) + (index % 4)),
      seatMap
    };
  });
}

function showNotification(msg, color = '#312084') {
  const el = document.getElementById('notification');
  el.innerHTML = `<div class='notif' style="background:${color};">${msg}</div>`;
  setTimeout(() => el.innerHTML = '', 1900);
}

function popup(msg, img) {
  document.getElementById('popup-content').innerHTML = `
    <img src="${img || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f44b.svg'}" />
    <div style="margin:1.1em 0 .81em 0;">${msg}</div>
    <button class="close-btn" onclick="closePopup()">OK</button>
  `;
  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

function setScreen(html) {
  document.getElementById('screen').innerHTML = `<div class="container"><div class="glass-card">${html}</div></div>`;
}

function showStart() {
  setScreen(`
    <h2>✨ Welcome to GoBus Travels</h2>
    <img src="https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=900&q=80" class="banner" alt="Travel bus" />
    <div class="role-btns">
      <button class="role-btn" onclick="selectRole('passenger')">
        <img src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png" alt="Passenger" />Passenger
      </button>
      <button class="role-btn" onclick="selectRole('driver')">
        <img src="https://cdn-icons-png.flaticon.com/512/1603/1603847.png" alt="Driver" />Driver
      </button>
      <button class="role-btn" onclick="selectRole('admin')">
        <img src="https://cdn-icons-png.flaticon.com/512/3284/3284815.png" alt="Admin" />Admin
      </button>
    </div>
    <div style="margin:2.35em 0 0 0;text-align:center;font-size:1.05em;">
      <span style="color:var(--main);font-weight:700;">One stop for secure, easy bus travel bookings!</span>
    </div>
  `);
}

function selectRole(role) {
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
  const idx = ['passenger', 'driver', 'admin'].indexOf(role);
  document.querySelectorAll('.role-btn')[idx].classList.add('selected');

  setTimeout(() => {
    if (role === 'passenger') signupPassenger();
    if (role === 'driver') loginDriver();
    if (role === 'admin') loginAdmin();
  }, 400);
}

function signupPassenger() {
  setScreen(`
    <div class="stepper">
      <span class="step active">1. Sign Up</span>
      <span class="step">2. Route & Bus</span>
      <span class="step">3. Seats</span>
      <span class="step">4. Pay</span>
    </div>
    <img src="https://cdn.pixabay.com/photo/2019/03/20/11/11/online-4068393_960_720.jpg" class="section-img" />
    <h2>Sign Up</h2>
    <form onsubmit="return handleSignup(this)">
      <input class="input" name="name" required minlength="2" placeholder="Full Name" />
      <input class="input" name="email" required type="email" placeholder="Gmail address" />
      <input class="input" name="phone" required pattern="[0-9]{10}" maxlength="10" placeholder="Phone Number" />
      <button type="button" class="main-btn" onclick="signupWithGoogle()">Sign up with Google</button>
      <button type="submit" class="main-btn">Sign Up</button>
      <button type="button" class="back-btn" onclick="showStart()">Back</button>
    </form>
    <div style="font-size:.97em;color:var(--main-dark)">Already registered? <a href="#" onclick="loginPassenger();return false;" style="color:var(--turquoise);font-weight:bold;">Log in</a></div>
  `);
}

function loginPassenger() {
  setScreen(`
    <img src="https://cdn.pixabay.com/photo/2018/03/01/10/32/bus-3187932_1280.jpg" class="section-img" />
    <h2>Passenger Login</h2>
    <form onsubmit="return handlePassengerLogin(this)">
      <input class="input" name="phone" required pattern="[0-9]{10}" maxlength="10" placeholder="Phone Number" />
      <button type="submit" class="main-btn">Log in</button>
      <button type="button" class="back-btn" onclick="signupPassenger()">Back</button>
    </form>
  `);
}

function signupWithGoogle() {
  popup('Signed up with Google! 🎉<br>Welcome to GoBus.', 'https://cdn-icons-png.flaticon.com/512/270/270798.png');
  setTimeout(() => chooseRoutePanel(), 1400);
  currSession = { id: Date.now(), name: 'Google User ' + Math.floor(Math.random() * 99), phone: '9' + Math.floor(1e9 + Math.random() * 9e8), email: 'googleuser@demo.com', role: 'passenger' };
  users.push(currSession);
}

function handleSignup(form) {
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !email || !phone) return false;
  if (users.some(u => u.email === email)) { showNotification('Email already registered!', '#fa5a5e'); return false; }
  if (users.some(u => u.phone === phone)) { showNotification('Phone already registered!', '#fa5a5e'); return false; }

  const newUser = { id: users.length + 1, name, email, phone, role: 'passenger' };
  users.push(newUser);
  currSession = newUser;
  popup(`Welcome, ${name.split(' ')[0]}!<br>Your GoBus account is ready.`, 'https://cdn-icons-png.flaticon.com/512/2329/2329202.png');
  setTimeout(() => chooseRoutePanel(), 1450);
  return false;
}

function handlePassengerLogin(form) {
  const phone = form.phone.value.trim();
  const user = users.find(u => u.phone === phone && u.role === 'passenger');
  if (!user) {
    showNotification('No account with this phone. Sign up first!', '#fa5a5e');
    return false;
  }
  currSession = user;
  showNotification('Welcome back!', '#27bcd4');
  setTimeout(chooseRoutePanel, 600);
  return false;
}

function chooseRoutePanel() {
  setScreen(`
    <div class="stepper">
      <span class="step">1. Sign Up</span>
      <span class="step active">2. Route & Bus</span>
      <span class="step">3. Seats</span>
      <span class="step">4. Pay</span>
    </div>
    <img src="https://cdn.pixabay.com/photo/2020/01/17/07/34/bus-47718_1280.jpg" class="route-img" />
    <h2>Select Route & Date</h2>
    <form onsubmit="return handleRouteChoose(this)">
      <label for="from"><b>From:</b></label>
      <select class="input" name="from" required style="max-width:220px;">
        <option value="">Select City</option>
        ${startCities.map(c => `<option>${c}</option>`).join('')}
      </select>
      <label for="to"><b>To:</b></label>
      <select class="input" name="to" required style="max-width:220px;">
        <option value="">Select City</option>
        ${endCities.map(c => `<option>${c}</option>`).join('')}
      </select>
      <label for="date"><b>Date:</b></label>
      <input class="input" type="date" name="date" min="${new Date().toISOString().slice(0,10)}" required style="max-width:160px;" />
      <label for="numseats" style="font-weight:700;">No. of Seats</label>
      <select class="input" style="max-width:170px;" name="numseats" required>
        ${[1, 2, 3, 4, 5].map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <button type="submit" class="main-btn">Show Buses</button>
      <button type="button" class="back-btn" onclick="signupPassenger()">Back</button>
    </form>
  `);
}

function handleRouteChoose(form) {
  const from = form.from.value;
  const to = form.to.value;
  const date = form.date.value;
  const numSeats = +form.numseats.value;

  if (!from || !to || !date) {
    showNotification('Please select route and date', '#fa5a5e');
    return false;
  }

  if (from === to) {
    showNotification('Select different cities', '#fa5a5e');
    return false;
  }

  selectionRoute = { from, to, date, numSeats };
  showBusList();
  return false;
}

function showBusList() {
  const routeKey = `${selectionRoute.from} → ${selectionRoute.to}`;
  const avail = buses.filter(bus => bus.route === routeKey && bus.seatsLeft >= selectionRoute.numSeats);

  if (!avail.length) {
    setScreen(`
      <h2>No buses found for that route/date</h2>
      <img src="https://cdn-icons-png.flaticon.com/512/190/190677.png" style="height:98px;margin:2em auto;display:block;" />
      <button class="main-btn" onclick="chooseRoutePanel()">Back to route selection</button>
    `);
    return;
  }

  setScreen(`
    <div class="stepper">
      <span class="step">1. Sign Up</span>
      <span class="step">2. Route & Bus</span>
      <span class="step active">3. Seats</span>
      <span class="step">4. Pay</span>
    </div>
    <h2>Pick your bus (${avail.length} found)</h2>
    <div class="bus-list">
      ${avail.map(bus => `
        <div class="bus-card">
          <div class="bus-info">
            <img src="${bus.img}" alt="bus" />
            <div>
              <span style="font-size:1.18em;font-weight:700;color:var(--main-dark);">${bus.busNum}</span>
              <div style="font-size:.97em;">${bus.operator}</div>
              <span style="color:var(--main2);font-weight:700;">₹${bus.price}</span>
            </div>
          </div>
          <div class="seat-label">
            Departure: ${bus.departure} | Seats Left: <b>${bus.seatsLeft}</b>
          </div>
          <button class="main-btn" style="margin-top:.6em;" onclick="selectBusForSeats(${bus.id})" ${bus.seatsLeft < selectionRoute.numSeats ? 'disabled' : ''}>Select & Seats</button>
        </div>
      `).join('')}
    </div>
    <button class="main-btn" onclick="chooseRoutePanel()" style="margin-top:2em;">Back</button>
  `);
}

function selectBusForSeats(busId) {
  const bus = buses.find(b => b.id == busId);
  setScreen(`
    <div class="stepper">
      <span class="step">1. Sign Up</span>
      <span class="step">2. Route & Bus</span>
      <span class="step">3. Seats</span>
      <span class="step active">4. Pay</span>
    </div>
    <h2>Select ${selectionRoute.numSeats} Seats</h2>
    <div style="margin-bottom:.6em;font-size:1.06em;">Bus: <b style="color:var(--main-dark);">${bus.busNum} (${bus.operator})</b><br />Seat arrangement below:</div>
    <div class="seat-grid" id="seatGrid"></div>
    <div style="margin:.6em 0;">
      <span style="display:inline-block;width:24px;height:15px;background:var(--seat-occupied);border-radius:4px;margin-right:.5em;vertical-align:middle;"></span>Occupied &nbsp;
      <span style="display:inline-block;width:24px;height:15px;background:var(--seat-selected);border-radius:4px;margin-right:.5em;vertical-align:middle;"></span>Your seat &nbsp;
      <span style="display:inline-block;width:24px;height:15px;background:var(--seat-available);border-radius:4px;margin-right:.5em;vertical-align:middle;"></span>Available
    </div>
    <form id="seatForm" onsubmit="return confirmSeatBook(${busId},this)">
      <input type="hidden" id="seat-inp" required name="seat" />
      <button type="submit" class="main-btn" id="bookBtn" disabled>Continue</button>
      <button type="button" class="back-btn" onclick="showBusList()">Back to Buses</button>
    </form>
  `);
  setTimeout(() => renderSeats(bus), 50);
}

function renderSeats(bus) {
  const grid = document.getElementById('seatGrid');
  grid.innerHTML = '';
  const selected = [];

  bus.seatMap.forEach((occ, i) => {
    const seat = document.createElement('div');
    seat.className = 'seat' + (occ === 1 ? ' occupied' : '');
    seat.innerHTML = i + 1;

    seat.onclick = function () {
      if (occ === 1) return;
      if (selected.includes(i)) {
        seat.classList.remove('selected');
        selected.splice(selected.indexOf(i), 1);
      } else {
        if (selected.length < selectionRoute.numSeats) {
          seat.classList.add('selected');
          selected.push(i);
        }
      }

      if (selected.length > selectionRoute.numSeats) {
        const idx = selected.shift();
        const seatNode = grid.children[idx];
        if (seatNode) seatNode.classList.remove('selected');
      }

      document.getElementById('seat-inp').value = selected.map(x => x + 1).join(',');
      document.getElementById('bookBtn').disabled = selected.length !== selectionRoute.numSeats;
    };

    grid.appendChild(seat);
  });
}

function confirmSeatBook(busId, form) {
  const seatNums = form.seat.value.split(',').map(s => +s - 1).filter(x => !isNaN(x));
  const bus = buses.find(b => b.id == busId);

  if (!seatNums.length || seatNums.some(s => bus.seatMap[s] === 1)) {
    showNotification('Seat just taken! Try another', '#fa5a5e');
    return false;
  }

  for (const s of seatNums) bus.seatMap[s] = 1;
  bus.seatsLeft -= seatNums.length;

  bookings.push({
    id: bookings.length + 1,
    userId: currSession.id,
    busId,
    seat: seatNums.map(x => x + 1),
    date: selectionRoute.date,
    driver: bus.driver,
    utr: null
  });

  showPaymentPage(bus, seatNums.map(x => x + 1));
  return false;
}

function showPaymentPage(bus, seatNos) {
  setScreen(`
    <h2>Pay & Confirm Booking</h2>
    <img src="https://cdn.pixabay.com/photo/2018/02/18/13/22/credit-card-3163354_1280.jpg" class="payimg" />
    <div style="margin-bottom:1.4em;font-size:1.07em;">
      <b>Total to Pay: <span style="color:var(--main2);">₹${bus.price * seatNos.length}</span></b><br /><br />
      <span style="color:#312084;font-weight:600;">Your Booking:</span>
      <div><b>Bus:</b> ${bus.busNum} - ${bus.route} @${bus.departure}</div>
      <div><b>Seats:</b> ${seatNos.map(x => `#${x}`).join(', ')}</div>
      <div><b>Name:</b> ${currSession.name} &emsp; <b>Phone:</b> ${currSession.phone}</div>
      <div><b>Date:</b> ${selectionRoute.date}</div>
    </div>
    <div class="notif" style="margin:1.1em auto;">${BANK_DETAILS}</div>
    <form onsubmit="return submitPayment(this,${bus.id},'${seatNos.join(',')}')">
      <input class="input" type="text" name="utr" required placeholder="Enter Reference No./UTR after payment" />
      <button type="submit" class="main-btn">Finish Booking</button>
      <button type="button" class="back-btn" onclick="selectBusForSeats(${bus.id})">Back</button>
    </form>
    <div style="font-size:13px;color:#6262a9;font-style:italic;margin:.6em 0;">(After UPI payment, please enter reference number [bank/UPI UTR].)</div>
  `);
}

function submitPayment(form, busId, seatNos) {
  const utr = form.utr.value.trim();
  if (!utr) {
    showNotification('Please fill reference!', '#fa5a5e');
    return false;
  }

  const bk = bookings.slice().reverse().find(item => item.userId === currSession.id && item.busId === busId && item.seat.join(',') === seatNos && !item.utr);
  if (bk) bk.utr = utr;

  popup('<span style="color:var(--main-dark);font-size:1.12em;">Booking Complete!<br>Thank you, payment received.</span>', 'https://cdn-icons-png.flaticon.com/512/1973/1973813.png');
  setTimeout(() => showPassengerBookings(), 1600);
  return false;
}

function showPassengerBookings() {
  const bks = bookings.filter(bk => bk.userId === currSession.id);
  setScreen(`
    <h2>My Bookings</h2>
    <table>
      <tr><th>Journey</th><th>Date</th><th>Seats</th><th>Payment Ref</th><th>Track</th></tr>
      ${bks.length ? bks.map(bk => {
        const bus = buses.find(b => b.id === bk.busId);
        return `<tr>
          <td>${bus.busNum}<br>${bus.route}<br>${bus.departure}</td><td>${bk.date}</td>
          <td>${bk.seat.map(x => `<b>#${x}</b>`).join(' ')}</td>
          <td>${bk.utr || "<em style='color:#e77922;'>Pending...</em>"}</td>
          <td><button class="small-btn" onclick="showTrackPassengerBus(${bus.id})">Track</button></td>
        </tr>`;
      }).join('') : '<tr><td colspan="5" style="color:#ea233b;">No bookings yet!</td></tr>'}
    </table>
    <button class="main-btn" onclick="chooseRoutePanel()">New Booking</button>
    <button class="back-btn" onclick="showStart()">Log out</button>
  `);
}

function showTrackPassengerBus(busId) {
  const bus = buses.find(b => b.id == busId);
  setScreen(`
    <h2>Track Your Bus: ${bus.busNum}</h2>
    <img src="${bus.img}" style="max-height:100px;display:block;margin:1em auto;" />
    <div id="live-map" style="height:320px;width:100%;border-radius:12px;overflow:hidden;"></div>
    <button class="main-btn" onclick="showPassengerBookings()" style="margin-top:1em;">Back to My Bookings</button>
  `);
  setTimeout(() => runBusMap(bus), 70);
}

function loginDriver() {
  setScreen(`
    <img src="https://cdn-icons-png.flaticon.com/512/1603/1603847.png" class="section-img" />
    <h2>Driver Login</h2>
    <form onsubmit="return handleUserLogin(this,'driver')">
      <input class="input" type="email" name="email" required placeholder="Email" />
      <input class="input" type="password" name="password" required placeholder="Password" />
      <button class="main-btn">Sign In</button>
      <button class="back-btn" type="button" onclick="showStart()">Back</button>
    </form>
  `);
}

function loginAdmin() {
  setScreen(`
    <img src="https://cdn-icons-png.flaticon.com/512/3284/3284815.png" class="section-img" />
    <h2>Admin Login</h2>
    <form onsubmit="return handleUserLogin(this,'admin')">
      <input class="input" type="email" name="email" required placeholder="Email" />
      <input class="input" type="password" name="password" required placeholder="Password" />
      <button class="main-btn">Sign In</button>
      <button class="back-btn" type="button" onclick="showStart()">Back</button>
    </form>
  `);
}

function handleUserLogin(form, role) {
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const user = users.find(u => u.email === email && u.password === password && u.role === role);

  if (!user) {
    showNotification('Invalid credentials!', '#fa5a5e');
    return false;
  }

  currSession = user;
  showNotification('Welcome!', '#27bcd4');
  if (role === 'admin') showAdminPanel();
  else showDriverPanel();
  return false;
}

function showAdminPanel() {
  setScreen(`
    <img src="https://cdn.pixabay.com/photo/2017/03/31/21/51/bus-2192137_1280.jpg" class="banner" />
    <h2>Admin Dashboard</h2>
    <table>
      <tr><th>Passenger</th><th>Phone</th><th>Date</th><th>Bus</th><th>Seats</th><th>Payment Ref</th></tr>
      ${bookings.length ? bookings.map(bk => {
        const bus = buses.find(b => b.id === bk.busId);
        const user = users.find(u => u.id === bk.userId);
        return `<tr><td>${user ? user.name : '?'}</td>
          <td>${user ? user.phone : '?'}</td>
          <td>${bk.date}</td>
          <td>${bus ? bus.busNum + '<br>' + bus.route : '?'}</td>
          <td>${bk.seat.map(x => `<b>#${x}</b>`).join(' ')}</td>
          <td>${bk.utr || "<em style='color:#e77922;'>Pending</em>"}</td></tr>`;
      }).join('') : '<tr><td colspan="6" style="color:#fa5a5e;">No bookings yet</td></tr>'}
    </table>
    <button class="main-btn" onclick="showStart()" style="margin-top:1em;">Log out</button>
  `);
}

function showDriverPanel() {
  const myBuses = buses.filter(b => b.driver === currSession.id);
  setScreen(`
    <img src="https://cdn-icons-png.flaticon.com/512/1603/1603847.png" class="banner" />
    <h2>Driver Panel</h2>
    ${myBuses.length ? myBuses.map(b => `
      <div style="margin:.7em 0;font-weight:700;">
        <span>${b.busNum} | ${b.route} (${b.departure})</span>
        <button class="small-btn" onclick="runDriverLiveMap(${b.id})">Track</button>
      </div>
    `).join('') : '<div style="color:#fa5a5e;">No bus assigned</div>'}
    <button class="main-btn" onclick="showStart()">Log out</button>
  `);
}

function runDriverLiveMap(busId) {
  showTrackPassengerBus(busId);
}

let currMap = null;
let busAnim = {};
let markerObj = null;

function runBusMap(bus) {
  if (currMap) {
    try { currMap.remove(); } catch (e) { /* ignore */ }
  }

  const coords = routeCoordinates[bus.route] || [[28.6139, 77.2090], [26.9124, 75.7873]];
  currMap = L.map('live-map').setView(coords[0], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(currMap);

  busAnim[bus.id] = busAnim[bus.id] || { p: 0, dir: 1 };
  if (markerObj) currMap.removeLayer(markerObj);

  function animate() {
    let p = busAnim[bus.id].p;
    busAnim[bus.id].p += 0.029 * busAnim[bus.id].dir;

    if (busAnim[bus.id].p >= 1) {
      busAnim[bus.id].dir = -1;
      busAnim[bus.id].p = 1;
    } else if (busAnim[bus.id].p <= 0) {
      busAnim[bus.id].dir = 1;
      busAnim[bus.id].p = 0;
    }

    const lat = coords[0][0] + (coords[1][0] - coords[0][0]) * busAnim[bus.id].p;
    const lng = coords[0][1] + (coords[1][1] - coords[0][1]) * busAnim[bus.id].p;

    if (markerObj) currMap.removeLayer(markerObj);

    markerObj = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190677.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(currMap).bindTooltip(`<b>${bus.busNum}</b>`);

    setTimeout(animate, 1200);
  }

  L.polyline(coords, { color: bus.id % 2 ? '#6159e4' : '#16e596', weight: 7, dashArray: '7,9' }).addTo(currMap);
  animate();
}

buildDemoBuses();
showStart();

window.selectRole = selectRole;
window.signupPassenger = signupPassenger;
window.loginPassenger = loginPassenger;
window.loginDriver = loginDriver;
window.loginAdmin = loginAdmin;
window.chooseRoutePanel = chooseRoutePanel;
window.handleRouteChoose = handleRouteChoose;
window.showBusList = showBusList;
window.selectBusForSeats = selectBusForSeats;
window.renderSeats = renderSeats;
window.confirmSeatBook = confirmSeatBook;
window.showPaymentPage = showPaymentPage;
window.submitPayment = submitPayment;
window.showPassengerBookings = showPassengerBookings;
window.showTrackPassengerBus = showTrackPassengerBus;
window.handleUserLogin = handleUserLogin;
window.showAdminPanel = showAdminPanel;
window.showDriverPanel = showDriverPanel;
window.runDriverLiveMap = runDriverLiveMap;
window.closePopup = closePopup;
