<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>KrishiSetu - Mandi Prices</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }

    body {
      background: #f4f8f3;
      color: #1f2937;
    }

    /* Header */
    header {
      background: #166534;
      color: white;
      padding: 18px 7%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 25px;
      font-weight: bold;
    }

    nav a {
      color: white;
      text-decoration: none;
      margin-left: 25px;
    }

    /* Hero */
    .hero {
      padding: 45px 7%;
      background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    }

    .hero h1 {
      font-size: 38px;
      color: #14532d;
      margin-bottom: 10px;
    }

    .hero p {
      color: #4b5563;
      margin-bottom: 25px;
    }

    /* Search */
    .search-box {
      display: flex;
      gap: 10px;
      max-width: 700px;
    }

    .search-box input,
    .search-box select {
      padding: 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }

    .search-box input {
      flex: 1;
    }

    /* Stats */
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 30px 7%;
    }

    .stat {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.08);
    }

    .stat h2 {
      color: #166534;
    }

    /* Mandi */
    .container {
      padding: 10px 7% 50px;
    }

    .container h2 {
      margin: 20px 0;
      color: #14532d;
    }

    .mandi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .mandi-card {
      background: white;
      padding: 22px;
      border-radius: 14px;
      box-shadow: 0 3px 15px rgba(0,0,0,0.08);
    }

    .mandi-card h3 {
      color: #166534;
      margin-bottom: 5px;
    }

    .location {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .crop {
      border-top: 1px solid #e5e7eb;
      padding: 14px 0;
    }

    .crop-name {
      font-weight: bold;
    }

    .price {
      font-size: 23px;
      font-weight: bold;
      margin: 5px 0;
    }

    .up {
      color: #15803d;
    }

    .down {
      color: #dc2626;
    }

    .details {
      display: flex;
      justify-content: space-between;
      color: #6b7280;
      font-size: 13px;
    }

    .compare-btn {
      width: 100%;
      padding: 11px;
      margin-top: 10px;
      border: none;
      border-radius: 7px;
      background: #166534;
      color: white;
      cursor: pointer;
    }

    .compare-btn:hover {
      background: #14532d;
    }

    /* AI */
    .ai-box {
      margin-top: 35px;
      padding: 25px;
      border-radius: 14px;
      background: #ecfdf5;
      border: 1px solid #bbf7d0;
    }

    .ai-box h2 {
      color: #166534;
      margin-bottom: 10px;
    }

    /* Footer */
    footer {
      background: #14532d;
      color: white;
      padding: 25px 7%;
      text-align: center;
    }

    @media(max-width: 700px) {
      header {
        flex-direction: column;
        gap: 15px;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .search-box {
        flex-direction: column;
      }

      .hero h1 {
        font-size: 28px;
      }
    }
  </style>
</head>

<body>

  <!-- HEADER -->
  <header>
    <div class="logo">🌾 KrishiSetu</div>

    <nav>
      <a href="#">Home</a>
      <a href="#">Mandi Prices</a>
      <a href="#">Buyers</a>
      <a href="#">My Crops</a>
    </nav>
  </header>


  <!-- HERO -->
  <section class="hero">

    <h1>Today's Mandi Prices</h1>

    <p>
      Check crop prices, compare mandis and find the better market for your produce.
    </p>

    <div class="search-box">

      <input
        type="text"
        id="search"
        placeholder="Search crop or mandi..."
        onkeyup="searchMandi()"
      >

      <select id="cropFilter" onchange="searchMandi()">
        <option value="all">All Crops</option>
        <option value="wheat">Wheat</option>
        <option value="mustard">Mustard</option>
        <option value="soybean">Soybean</option>
        <option value="onion">Onion</option>
      </select>

    </div>

  </section>


  <!-- STATS -->
  <section class="stats">

    <div class="stat">
      <p>Mandis Covered</p>
      <h2>16+</h2>
    </div>

    <div class="stat">
      <p>Live Crop Prices</p>
      <h2>50+</h2>
    </div>

    <div class="stat">
      <p>Price Updates</p>
      <h2>Live</h2>
    </div>

  </section>


  <!-- MANDI CARDS -->
  <main class="container">

    <h2>🏪 Mandi Rates</h2>

    <div class="mandi-grid" id="mandiContainer">


      <!-- Jaipur -->
      <div class="mandi-card"
           data-search="jaipur wheat mustard onion">

        <h3>Jaipur Surajpole Mandi</h3>

        <p class="location">
          📍 Jaipur, Rajasthan • 18 km away
        </p>

        <div class="crop">
          <span class="crop-name">Wheat</span>

          <div class="price">₹2,650/qtl</div>

          <span class="up">▲ +2.3%</span>

          <div class="details">
            <span>Range: ₹2420–₹2780</span>
            <span>Arrival: 8400 Qtl</span>
          </div>
        </div>

        <div class="crop">
          <span class="crop-name">Mustard</span>

          <div class="price">₹5,820/qtl</div>

          <span class="up">▲ +1.0%</span>

          <div class="details">
            <span>Range: ₹5450–₹5950</span>
            <span>Freight: ₹35</span>
          </div>
        </div>

        <button class="compare-btn"
                onclick="compare('Jaipur Surajpole Mandi')">
          Compare Mandi
        </button>

      </div>


      <!-- Ajmer -->
      <div class="mandi-card"
           data-search="ajmer wheat mustard">

        <h3>Ajmer Krishi Upaj Mandi</h3>

        <p class="location">
          📍 Ajmer, Rajasthan • 32 km away
        </p>

        <div class="crop">
          <span class="crop-name">Wheat</span>

          <div class="price">₹2,520/qtl</div>

          <span class="up">▲ +0.4%</span>

          <div class="details">
            <span>Range: ₹2350–₹2680</span>
            <span>Arrival: 4200 Qtl</span>
          </div>
        </div>

        <div class="crop">
          <span class="crop-name">Mustard</span>

          <div class="price">₹5,690/qtl</div>

          <span class="up">▲ +0.7%</span>

          <div class="details">
            <span>Range: ₹5300–₹5800</span>
            <span>Freight: ₹55</span>
          </div>
        </div>

        <button class="compare-btn"
                onclick="compare('Ajmer Krishi Upaj Mandi')">
          Compare Mandi
        </button>

      </div>


      <!-- Kota -->
      <div class="mandi-card"
           data-search="kota wheat soybean mustard">

        <h3>Kota Bhamashah Mandi</h3>

        <p class="location">
          📍 Kota, Rajasthan • 95 km away
        </p>

        <div class="crop">
          <span class="crop-name">Wheat</span>

          <div class="price">₹2,710/qtl</div>

          <span class="up">▲ +2.6%</span>

          <div class="details">
            <span>Range: ₹2480–₹2820</span>
            <span>Arrival: 16500 Qtl</span>
          </div>
        </div>

        <div class="crop">
          <span class="crop-name">Soybean</span>

          <div class="price">₹4,720/qtl</div>

          <span class="up">▲ +1.5%</span>

          <div class="details">
            <span>Range: ₹4400–₹4890</span>
            <span>Freight: ₹110</span>
          </div>
        </div>

        <button class="compare-btn"
                onclick="compare('Kota Bhamashah Mandi')">
          Compare Mandi
        </button>

      </div>


      <!-- Delhi -->
      <div class="mandi-card"
           data-search="delhi onion potato tomato">

        <h3>Delhi Azadpur Mandi</h3>

        <p class="location">
          📍 Delhi • 240 km away
        </p>

        <div class="crop">
          <span class="crop-name">Onion</span>

          <div class="price">₹2,050/qtl</div>

          <span class="up">▲ +6.7%</span>

          <div class="details">
            <span>Range: ₹1650–₹2250</span>
            <span>Arrival: 45000 Qtl</span>
          </div>
        </div>

        <div class="crop">
          <span class="crop-name">Tomato</span>

          <div class="price">₹2,400/qtl</div>

          <span class="up">▲ +6.6%</span>

          <div class="details">
            <span>Range: ₹1800–₹2800</span>
            <span>Freight: ₹210</span>
          </div>
        </div>

        <button class="compare-btn"
                onclick="compare('Delhi Azadpur Mandi')">
          Compare Mandi
        </button>

      </div>

    </div>


    <!-- AI SECTION -->
    <div class="ai-box">

      <h2>🤖 AI Price Intelligence</h2>

      <p>
        <strong>Wheat:</strong>
        Current modal price is ₹2,650/qtl.
      </p>

      <p>
        📈 Price trend is positive. Based on the current trend,
        farmers can compare nearby mandis before selling.
      </p>

      <br>

      <button class="compare-btn"
              onclick="showRecommendation()">
        Get AI Recommendation
      </button>

      <p id="recommendation"></p>

    </div>

  </main>


  <!-- FOOTER -->
  <footer>

    <h3>🌾 KrishiSetu</h3>

    <p>
      Smart Mandi Intelligence • Better Price Discovery • Direct Market Access
    </p>

    <p>
      © 2026 KrishiSetu
    </p>

  </footer>


  <script>

    // SEARCH FUNCTION
    function searchMandi() {

      let search =
        document.getElementById("search")
        .value
        .toLowerCase();

      let filter =
        document.getElementById("cropFilter")
        .value
        .toLowerCase();

      let cards =
        document.querySelectorAll(".mandi-card");

      cards.forEach(card => {

        let data =
          card.getAttribute("data-search");

        let searchMatch =
          data.includes(search);

        let cropMatch =
          filter === "all" ||
          data.includes(filter);

        if (searchMatch && cropMatch) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }

      });

    }


    // COMPARE BUTTON
    function compare(mandi) {

      alert(
        "You selected " +
        mandi +
        " for market comparison."
      );

    }


    // AI RECOMMENDATION
    function showRecommendation() {

      document.getElementById("recommendation").innerHTML =
        "<br><strong>AI Suggestion:</strong> " +
        "Wheat prices are showing a positive trend. " +
        "Compare nearby mandis, transportation cost and " +
        "expected selling price before making a decision.";

    }

  </script>

</body>
</html>
