// Check if the user is loggedin since the loggin users have diffferent features .. such as review and favourite
function isLoggedIn() {
    var token = localStorage.getItem('token'); 
    return token !== null; // Return true if token is present and indicating the user is logged in
  }
  
  // Function to toggle display pages based on login status
  function toggleLinks() {
    var viewreview = document.querySelector('a[href="viewreview.html"]');
    var profileLink = document.getElementById('profile-link');
    var logoutLink = document.getElementById('logout-link');
    var signupLink = document.getElementById('signup-link');
    var addPropertyButton = document.getElementById('add-property-button');
    var addserviceButton = document.getElementById('add-service-button');

  
    if (isLoggedIn()) {
      profileLink.style.display = 'block';
      logoutLink.style.display = 'block';
      viewreview.style.display = 'block';
      signupLink.style.display = 'none';
      addPropertyButton.style.display = 'block';
      addserviceButton.style.display = 'block';

    } else {
      profileLink.style.display = 'none';
      logoutLink.style.display = 'none';
      viewreview.style.display = 'none';
      signupLink.style.display = 'block';
      addPropertyButton.style.display = 'none';
      addserviceButton.style.display = 'none';
  
    }
  }
  

//properties .. 
     
document.addEventListener('DOMContentLoaded', function () {
    let data;

    const propertyList = document.getElementById('propertyList');
    const searchInput = document.getElementById('searchInput');

    fetch('http://localhost:3016/properties')
        .then(response => response.json())
        .then(propertyData => {
            data = propertyData;
            renderProperties(data);
            toggleLinks(); // Call toggleLinks to update the display of links based on login status
        })
        .catch(error => console.error('Error fetching properties:', error));

    searchInput.addEventListener('input', function () {
        const searchQuery = this.value.toLowerCase();
        const filteredProperties = data.filter(property => {
            return (
                property.property_name.toLowerCase().includes(searchQuery) ||
                property.description.toLowerCase().includes(searchQuery) ||
                property.owner_name.toLowerCase().includes(searchQuery)
            );
        });
        renderProperties(filteredProperties);
    });

    function renderProperties(properties) {
        propertyList.innerHTML = '';
        const userLoggedIn = isLoggedIn(); // Check if the user is logged in
        properties.forEach(property => {
            const isFavorited = localStorage.getItem(`favorite-${property.id}`) === 'true';
            const favoriteClass = isFavorited ? 'favorite-active' : '';
            const card = `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${property.image_url}" class="card-img-top" alt="Property Image">
                        <div class="card-body">
                            <h5 class="card-title">${property.property_name}</h5>
                            <p class="card-text">Price: ${property.price}</p>
                            <p class="card-text">Description: ${property.description}</p>
                            <p class="card-text">Owner Name: ${property.owner_name}</p>
                            <p class="card-text">Owner Contact: ${property.owner_contact}</p> 
                            ${userLoggedIn ?   `<button class="favorite-btn ${favoriteClass}" data-id="${property.id}">&#x2665 </button> <br>` : ''}
                            ${userLoggedIn ? `<a class="add-property-btn" href="addreview.html">Add Your Review</a> ` : ''}
                        </div>
                    </div>
                </div>
            `;
            propertyList.innerHTML += card;
        });
        attachFavoriteEventListeners();
    }

    function attachFavoriteEventListeners() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const propertyId = this.getAttribute('data-id');
                const isFavorited = localStorage.getItem(`favorite-${propertyId}`) === 'true';
                localStorage.setItem(`favorite-${propertyId}`, !isFavorited);
                console.log(`Favorite status for property ${propertyId}:`, !isFavorited); // Debugging line
                this.classList.toggle('favorite-active');
            });
        });
    }
});



//Services ..

document.addEventListener('DOMContentLoaded', function () {
    let data;
  
    const serviceList = document.getElementById('serviceList');
    const searchInput = document.getElementById('searchInput');
  
    fetch('http://localhost:3016/services')
      .then(response => response.json())
      .then(serviceData => {
        data = serviceData;
        renderServices(data);
      })
      .catch(error => console.error('Error fetching services:', error));
  
    searchInput.addEventListener('input', function () {
      const searchQuery = this.value.toLowerCase();
      const filteredServices = data.filter(service => {
        return (
          service.name.toLowerCase().includes(searchQuery) ||
          service.description.toLowerCase().includes(searchQuery)
        );
      });
      renderServices(filteredServices);
    });
  
    function renderServices(services) {
      serviceList.innerHTML = '';
      const userLoggedIn = isLoggedIn(); // Check if the user is logged in
      services.forEach(service => {
        const isFavorited = localStorage.getItem(`favorite-service-${service.id}`) === 'true';
        const favoriteClass = isFavorited ? 'favorite-active' : '';
        const card = `
          <div class="col-md-4">
            <div class="card">
              <img src="${service.image}" class="card-img-top" alt="Service Image">
              <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <p class="card-text">Description: ${service.description}</p>
                ${userLoggedIn ? `<button class="favorite-btn ${favoriteClass}" data-id="${service.id}"> &#x2665 </button> <br>` : ''}
                ${userLoggedIn ? `<a class="add-service-btn" href="addreview.html"> Add Your Review</a>` : ''}
              </div>
            </div>
          </div>
        `;
        serviceList.innerHTML += card;
      });
      attachFavoriteEventListeners();
    }
  
    function attachFavoriteEventListeners() {
      const favoriteButtons = document.querySelectorAll('.favorite-btn');
      favoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
          const serviceId = this.getAttribute('data-id');
          const isFavorited = localStorage.getItem(`favorite-service-${serviceId}`) === 'true';
          localStorage.setItem(`favorite-service-${serviceId}`, !isFavorited);
          this.classList.toggle('favorite-active');
        });
          });
      }
  });




// View Review .. 
function fetchReviews() {
    fetch('http://localhost:3016/reviews')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(reviews => {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = ''; // Clear the existing reviews
        reviews.forEach(review => {
          const reviewCard = document.createElement('div');
          reviewCard.className = 'review-card';
          reviewCard.innerHTML = `
            <p>${review.comment}</p>
          `;
          reviewsList.appendChild(reviewCard);
        });
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });
  }
  
  // Fetch reviews when the page loads
  document.addEventListener('DOMContentLoaded', fetchReviews);
  
  // Function to handle logout
  function logout() {
    localStorage.removeItem('token');
    toggleLinks(); 
    window.location.href = 'home.html'; 
  
  }
  
  window.onload = toggleLinks;

