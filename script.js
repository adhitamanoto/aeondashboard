/* script.js */
// Data Dummy: Array objek mall
const malls = [
    {
      name: "AEON Mall BSD City",
      coords: [-6.3025, 106.7078],
      area: 150000,
      visitors: { weekday: 8000, weekend: 12000 },
      nearestToll: { name: "BSD Toll Gate", distance: 3.2 }
    },
    {
      name: "AEON Mall Jakarta Garden City",
      coords: [-6.1919, 106.8944],
      area: 130000,
      visitors: { weekday: 7000, weekend: 10000 },
      nearestToll: { name: "Cikunir 2 Toll Gate", distance: 4.0 }
    },
    {
      name: "AEON Mall Sentul City",
      coords: [-6.5550, 106.9123],
      area: 90000,
      visitors: { weekday: 6000, weekend: 9000 },
      nearestToll: { name: "Sentul Selatan Toll Gate", distance: 2.8 }
    },
    {
      name: "AEON Mall Bekasi",
      coords: [-6.2345, 107.0000],
      area: 120000,
      visitors: { weekday: 7500, weekend: 11500 },
      nearestToll: { name: "Bekasi Timur Toll Gate", distance: 5.5 }
    }
  ];
  
  // Inisiasi peta Leaflet
  const map = L.map('map').setView([-6.3, 106.8], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Simpan marker untuk update
  let markers = [];
  
  // Inisiasi opsi select
  const mallSelect = document.getElementById('mallSelect');
  malls.forEach((mall, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = mall.name;
    mallSelect.appendChild(opt);
  });
  
  // Fungsi update dashboard
  function updateDashboard() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
  
    const selected = mallSelect.value;
    let filtered = [];
    if (selected === 'all') filtered = malls;
    else filtered = [malls[parseInt(selected)]];
  
    const infoCardsContainer = document.getElementById('info-cards');
    infoCardsContainer.innerHTML = '';
  
    const labels = [];
    const dataWeekday = [];
    const dataWeekend = [];
  
    filtered.forEach(mall => {
      const marker = L.marker(mall.coords).addTo(map)
        .bindPopup(`<b>${mall.name}</b><br>Area: ${mall.area.toLocaleString()} m²<br>Tol Terdekat: ${mall.nearestToll.name} (${mall.nearestToll.distance} km)`);
      markers.push(marker);
  
      const card = document.createElement('div');
      card.className = 'info-card';
      card.innerHTML = `
        <h3>${mall.name}</h3>
        <p><strong>Luas:</strong> ${mall.area.toLocaleString()} m²</p>
        <p><strong>Pengunjung Rata-rata:</strong></p>
        <ul>
          <li>Weekday: ${mall.visitors.weekday.toLocaleString()} orang/hari</li>
          <li>Weekend: ${mall.visitors.weekend.toLocaleString()} orang/hari</li>
        </ul>
        <p><strong>Tol Terdekat:</strong> ${mall.nearestToll.name} (${mall.nearestToll.distance} km)</p>
      `;
      infoCardsContainer.appendChild(card);
  
      labels.push(mall.name);
      dataWeekday.push(mall.visitors.weekday);
      dataWeekend.push(mall.visitors.weekend);
    });
  
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  
    updateInsights(filtered);
    updateChart(labels, dataWeekday, dataWeekend);
  }
  
  function updateInsights(filtered) {
    const insightsContainer = document.getElementById('insights');
    insightsContainer.innerHTML = '';
    if (filtered.length === 0) return;
  
    const avgWeekday = Math.round(filtered.reduce((sum, m) => sum + m.visitors.weekday, 0) / filtered.length);
    const avgWeekend = Math.round(filtered.reduce((sum, m) => sum + m.visitors.weekend, 0) / filtered.length);
    const p = document.createElement('p');
    p.innerHTML = `Rata-rata pengunjung:<br>- Weekday: <strong>${avgWeekday.toLocaleString()}</strong> orang/hari<br>- Weekend: <strong>${avgWeekend.toLocaleString()}</strong> orang/hari`;
    insightsContainer.appendChild(p);
  
    if (filtered.length > 1) {
      const sortedByArea = filtered.slice().sort((a, b) => b.area - a.area);
      const largest = sortedByArea[0];
      const smallest = sortedByArea[sortedByArea.length - 1];
      const p2 = document.createElement('p');
      p2.innerHTML = `Area terbesar: <strong>${largest.name}</strong> (${largest.area.toLocaleString()} m²)<br>Area terkecil: <strong>${smallest.name}</strong> (${smallest.area.toLocaleString()} m²)`;
      insightsContainer.appendChild(p2);
    }
  }
  
  let visitorChart;
  function updateChart(labels, dataWeekday, dataWeekend) {
    const ctx = document.getElementById('visitorChart').getContext('2d');
    if (visitorChart) {
      visitorChart.data.labels = labels;
      visitorChart.data.datasets[0].data = dataWeekday;
      visitorChart.data.datasets[1].data = dataWeekend;
      visitorChart.update();
    } else {
      visitorChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Weekday', data: dataWeekday },
            { label: 'Weekend', data: dataWeekend }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }
  
  mallSelect.addEventListener('change', updateDashboard);
  updateDashboard();
  