//Admin loggin 

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    fetch('http://localhost:3017/loginadmin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            window.location.href = 'adminstrator.html'; // Redirect to admin dashboard
        } else {
            errorMessage.textContent = 'Invalid username or password';
        }
    })
    .catch(error => {
        errorMessage.textContent = 'An error occurred. Please try again later.';
        console.error('Error:', error);
    });
});

//Adminstrator DashBoard 
document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const updateMessage = document.getElementById('updateMessage');
    
    fetch('http://localhost:3017/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Admin credentials updated successfully.') {
            updateMessage.textContent = 'Credentials updated successfully.';
            updateMessage.style.color = 'green';
        } else {
            updateMessage.textContent = 'Error updating credentials.';
            updateMessage.style.color = 'red';
        }
    })
    .catch(error => {
        updateMessage.textContent = 'An error occurred. Please try again later.';
        updateMessage.style.color = 'red';
        console.error('Error:', error);
    });
});



//Get proprites 
document.addEventListener('DOMContentLoaded', () => {
    const propertiesTableBody = document.querySelector('#propertiesTable tbody');

    // Fetch and display properties
    fetch('http://localhost:3016/properties')
        .then(response => response.json())
        .then(properties => {
            properties.forEach(property => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${property.id}</td>
                    <td>${property.property_name}</td>
                    <td>${property.price}</td>
                    <td>${property.description}</td>
                    <td>${property.owner_name}</td>
                    <td>${property.owner_contact}</td>
                    <td><img src="${property.image_url}" alt="Property Image"></td>
                    <td>
                        <button class="update" onclick="updateProperty(${property.id})">Update</button>
                        <button class="delete" onclick="deleteProperty(${property.id})">Delete</button>
                    </td>
                `;

                propertiesTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching properties:', error));

    // Function to delete a property
    window.deleteProperty = function(id) {
        if (confirm('Are you sure you want to delete this property?')) {
            fetch(`http://localhost:3016/delete_property/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        alert('Property deleted successfully');
                        location.reload(); // Refresh the page to see the changes
                    } else {
                        alert('Error deleting property');
                    }
                })
                .catch(error => console.error('Error deleting property:', error));
        }
    };

    // Function to update a property
    window.updateProperty = function(id) {
        const propertyName = prompt('Enter new property name:');
        const price = prompt('Enter new price:');
        const description = prompt('Enter new description:');
        const ownerName = prompt('Enter new owner name:');
        const ownerContact = prompt('Enter new owner contact:');
        const imageUrl = prompt('Enter new image URL:');

        if (propertyName && price && description && ownerName && ownerContact && imageUrl) {
            const updatedData = {
                property_name: propertyName,
                price: price,
                description: description,
                owner_name: ownerName,
                owner_contact: ownerContact,
                image_url: imageUrl
            };

            fetch(`http://localhost:3016/update_property/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            })
                .then(response => {
                    if (response.ok) {
                        alert('Property updated successfully');
                        location.reload(); // Refresh the page to see the changes
                    } else {
                        alert('Error updating property');
                    }
                })
                .catch(error => console.error('Error updating property:', error));
        } else {
            alert('All fields are required to update the property');
        }
    };
});

//Get services .......... 
document.addEventListener('DOMContentLoaded', () => {
    const servicesTableBody = document.querySelector('#servicesTable tbody');

    // Fetch and display services
    fetch('http://localhost:3016/services')
        .then(response => response.json())
        .then(services => {
            services.forEach(service => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${service.id}</td>
                    <td><img src="${service.image}" alt="Service Image"></td>
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                    <td>
                        <button class="update" onclick="updateService(${service.id})">Update</button>
                        <button class="delete" onclick="deleteService(${service.id})">Delete</button>
                    </td>
                `;

                servicesTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching services:', error));

    // Function to delete a service
    window.deleteService = function(id) {
        if (confirm('Are you sure you want to delete this service?')) {
            fetch(`http://localhost:3016/delete_service/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        alert('Service deleted successfully');
                        location.reload(); // Refresh the page to see the changes
                    } else {
                        alert('Error deleting service');
                    }
                })
                .catch(error => console.error('Error deleting service:', error));
        }
    };

    // Function to update a service
    window.updateService = function(id) {
        const image = prompt('Enter new image URL:');
        const name = prompt('Enter new name:');
        const description = prompt('Enter new description:');

        if (image && name && description) {
            const updatedData = {
                image: image,
                name: name,
                description: description
            };

            fetch(`http://localhost:3016/update_service/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            })
                .then(response => {
                    if (response.ok) {
                        alert('Service updated successfully');
                        location.reload(); // Refresh the page to see the changes
                    } else {
                        alert('Error updating service');
                    }
                })
                .catch(error => console.error('Error updating service:', error));
        } else {
            alert('All fields are required to update the service');
        }
    };
});


