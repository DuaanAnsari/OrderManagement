const { jsPDF } = window.jspdf;
let editIndex = -1; // Store the index of the row being edited

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrders() {
    let storedData = localStorage.getItem('orders');
    return storedData ? JSON.parse(storedData) : [];
}

function displayOrders(orders) {
    let output = "";

    let groupedOrders = orders.reduce((acc, order) => {
        let key = `${order.name}_${order.size}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(order);
        return acc;
    }, {});

    for (let key in groupedOrders) {
        let [name, size] = key.split('_');
        let totalReceivedPieces = 0;
        let totalRemainingPieces = 0;
        let totalRolls = 0;
        let totalDeliveredRolls = 0;
        let totalRemainingRolls = 0;
        let totalDyedInHouse = 0;
        let totalDeliveredPieces = 0;
        let totalDyedPieces = 0;

        output += `<h2>${name} (Size: ${size})</h2>`;
        output += `
            <div style="overflow-x: auto;">
                <table>
                    <tr>
                        <th class="sticky">Order Number</th>
                        <th>Date</th>
                        <th>D. Chalan Number</th>
                        <th>R. Chalan Number</th>
                        <th>GatePass Number</th>
                        <th>Color</th>
                        <th>Rolls</th>
                        <th>Delivered Rolls</th>
                        <th>Remaining Rolls</th>
                        <th>Received Pieces</th>
                        <th>Dyed Pieces</th>
                        <th>Remaining Pieces to Dye</th>
                        <th>Delivered Pieces</th>
                        <th>Dyed Pieces in House</th>
                        <th>Size</th>
                        <th>Vehicle Number</th>
                        <th>Actions</th>
                    </tr>
        `;

        groupedOrders[key].forEach((order, index) => {
            let remainingRolls = order.rolls - order.deliveredRolls;
            let remainingToDye = order.receivedPieces - order.dyedPieces;
            let remainingDyedPieces = order.dyedPieces - order.deliveredPieces;

            totalReceivedPieces += parseInt(order.receivedPieces);
            totalRemainingPieces += remainingToDye;
            totalRolls += parseInt(order.rolls);
            totalDeliveredRolls += parseInt(order.deliveredRolls);
            totalRemainingRolls += remainingRolls;
            totalDyedInHouse += remainingDyedPieces;
            totalDeliveredPieces += parseInt(order.deliveredPieces);
            totalDyedPieces += parseInt(order.dyedPieces);

            output += `
                <tr>
                    <td class="sticky">${order.orderNumber}</td>
                    <td>${order.date.split('-').reverse().join('/')}</td>
                    <td>${order.chalanNumber}</td>
                    <td>${order.r_chalanNumber}</td>
                    <td>${order.gatePassNumber}</td>
                    <td>${order.color}</td>
                    <td>${order.rolls}</td>
                    <td>${order.deliveredRolls}</td>
                    <td>${remainingRolls}</td>
                    
                    <td>${order.receivedPieces}</td>
                    <td>${order.dyedPieces}</td>
                    <td>${remainingToDye}</td>
                    <td>${order.deliveredPieces}</td>
                    <td>${remainingDyedPieces}</td>
                    <td>${order.size}</td>
                    <td>${order.vehicleNumber}</td>
                    <td class="action-buttons">
                        <button class="edit-button" onclick="editOrder(${index})">Edit</button>
                        <br>
                        <button class="delete-button" style="background-color: red; color: white;" onclick="deleteOrder(${index})">Delete</button>

                    </td>
                </tr>
            `;
        });

        // Add the summary row at the end of the table
        output += `
            <tr style="font-weight: bold;">
                <td class="sticky">Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${totalRolls}</td>
                <td>${totalDeliveredRolls}</td>
                <td>${totalRemainingRolls}</td>
                
                <td>${totalReceivedPieces}</td>
                <td>${totalDyedPieces}</td>
                <td>${totalRemainingPieces}</td>
                <td>${totalDeliveredPieces}</td>
                <td>${totalDyedInHouse}</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;

        output += `</table></div>
            <button class="download-pdf-button" onclick="generatePDF('${name}', '${size}')">Generate PDF</button>
        `;
    }

    document.getElementById('output').innerHTML = output;
}

function generatePDF(name, size) {
    const orders = loadOrders();
    const filteredOrders = orders.filter(order => order.name === name && order.size === size);

    const doc = new jsPDF('landscape', 'mm', 'a4'); // Changed to landscape mode
    
    doc.setFontSize(12);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text('Zeba Textile Mills', 148.5, 20, { align: 'center' }); // Centered in landscape mode (width = 297mm / 2)
    doc.setFontSize(12);
doc.text(`Name: ${name}`, 148.5, 27, { align: 'center' });
doc.text(`Size: ${size}`, 148.5, 32, { align: 'center' });
    doc.line(98.5, 22, 198.5, 22);

    // Table start coordinates
    let startX = 5;
    let startY = 40;
    let pageWidth = 297; // A4 landscape width in mm
    let colWidths = [16.5, 22, 20, 20, 20, 18, 15, 15, 15, 20, 20, 22, 20, 25, 18.5, 0]; // Adjusted column widths to fit the page

    // Column Headers
    doc.setFontSize(10);
    const headers = ['Order', 'Date', 'D.C', 'R.C', 'GatePass', 'Color', 'Rolls', 'D.', 'R.', 'Pieces', 'Dyed', 'Remaining', 'Delivered', 'D.Pieces', 'Vehicle'];

    let x = startX;
    headers.forEach((header, i) => {
        doc.text(header, x + 2, 40); // +2 for padding inside the cell
        x += colWidths[i];
    });
    const headers2 = ['', '', '', '', '', '', '', 'Rolls', 'Rolls', '', 'Pieces', 'To Dye', 'Pieces', 'In House', 'Number'];

    let x1 = 5;
    headers2.forEach((header, i) => {
        doc.text(header, x1 + 2, 43.5); // +2 for padding inside the cell
        x1 += colWidths[i];
    });

    doc.setFont("helvetica", "normal");
    // Draw horizontal line above the header
    doc.line(startX, startY - 5, 292.1, startY - 5);
    // Draw horizontal line below the header
    doc.line(startX, 45, 292.1, 45);

    // Data Rows
    startY += 10;  // Move below the header

    // Initialize totals
    let totalRolls = 0;
    let totalDeliveredRolls = 0;
    let totalRemainingRolls = 0;
    let totalReceivedPieces = 0;
    let totalDyedPieces = 0;
    let totalRemainingToDye = 0;
    let totalDeliveredPieces = 0;
    let totalDyedPiecesInHouse = 0;

    filteredOrders.forEach(order => {
        x = startX;
        let remainingRolls = order.rolls - order.deliveredRolls;
        let remainingToDye = order.receivedPieces - order.dyedPieces;
        let remainingDyedPieces = order.dyedPieces - order.deliveredPieces;

        let rowData = [
            order.orderNumber, 
            order.date, 
            order.chalanNumber, 
            order.r_chalanNumber,
            order.gatePassNumber, 
            order.color, 
            order.rolls, 
            order.deliveredRolls,
            remainingRolls, 
            order.receivedPieces,
            order.dyedPieces, 
            remainingToDye,
            order.deliveredPieces, 
            remainingDyedPieces, 
            order.vehicleNumber
        ];

        // Update totals
        totalRolls += order.rolls;
        totalDeliveredRolls += order.deliveredRolls;
        totalRemainingRolls += remainingRolls;
        totalReceivedPieces += order.receivedPieces;
        totalDyedPieces += order.dyedPieces;
        totalRemainingToDye += remainingToDye;
        totalDeliveredPieces += order.deliveredPieces;
        totalDyedPiecesInHouse += remainingDyedPieces;

        rowData.forEach((cell, i) => {
            doc.text(String(cell), x + 2, startY);  // +2 for padding
            x += colWidths[i];
        });

        // Draw horizontal line after each row
        doc.line(startX, startY + 2, x, startY + 2);

        startY += 6;  // Move to the next row
    });

// Change the text color for totals row

doc.setFont("helvetica", "bold");
    // Total Row (last row with real totals)
    let totalRow = [
        'Total', '', '', '', '', '', 
        totalRolls, 
        totalDeliveredRolls, 
        totalRemainingRolls, 
        totalReceivedPieces, 
        totalDyedPieces, 
        totalRemainingToDye, 
        totalDeliveredPieces, 
        totalDyedPiecesInHouse, 
        ''
    ];

    x = startX;
    totalRow.forEach((cell, i) => {
        doc.text(String(cell), x + 2, startY);
        x += colWidths[i];
    });

    // Draw horizontal line after the total row
    doc.line(startX, startY + 2, x, startY + 2);

    // Draw vertical lines to form the table grid
    let yPos = 35;  // Starting Y position for header
    colWidths.forEach((width, i) => {
        let colX = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.line(colX, yPos, colX, startY + 2);  // Draw from header to the end of the data
    });
            // Set watermark properties
            doc.setFont("helvetica", "normal");
doc.setFontSize(8); // Large font size for watermark
doc.setTextColor(150, 150, 150); // Darker gray color for watermark

doc.text('Report System Build By Duaan Ansari', 210, 200); // Positioned at the bottom-right corner, rotated

   // Save the PDF
doc.save(`Order_${name}_${size}.pdf`);
    // // Create the PDF as a Blob
    // const pdfBlob = doc.output('blob');

    
    // const pdfUrl = URL.createObjectURL(pdfBlob);
    // window.open(pdfUrl);
}

function submitOrder(event) {
    event.preventDefault();

    let orders = loadOrders();
    let form = event.target;

    let newOrder = {
        orderNumber: form.orderNumber.value,
        name: form.name.value,
        chalanNumber: form.chalanNumber.value,
        r_chalanNumber: form.r_chalanNumber.value,
        color: form.color.value,
        rolls: parseInt(form.rolls.value),
        deliveredRolls: parseInt(form.deliveredRolls.value),
        gatePassNumber: form.gatePassNumber.value,
        receivedPieces: parseInt(form.receivedPieces.value),
        dyedPieces: parseInt(form.dyedPieces.value),
        deliveredPieces: parseInt(form.deliveredPieces.value),
        date: form.date.value,
        size: form.size.value,
        vehicleNumber: form.vehicleNumber.value
    };

    if (editIndex === -1) {
        orders.push(newOrder);
    } else {
        orders[editIndex] = newOrder;
        editIndex = -1; // Reset edit index
    }

    saveOrders(orders);
    displayOrders(orders);
    form.reset();
}

function editOrder(index) {
    let orders = loadOrders();
    let order = orders[index];

    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('name').value = order.name;
    document.getElementById('chalanNumber').value = order.chalanNumber;
    document.getElementById('r_chalanNumber').value = order.r_chalanNumber;
    document.getElementById('color').value = order.color;
    document.getElementById('rolls').value = order.rolls;
    document.getElementById('deliveredRolls').value = order.deliveredRolls;
    document.getElementById('gatePassNumber').value = order.gatePassNumber;
    document.getElementById('receivedPieces').value = order.receivedPieces;
    document.getElementById('dyedPieces').value = order.dyedPieces;
    document.getElementById('deliveredPieces').value = order.deliveredPieces;
    document.getElementById('date').value = order.date;
    document.getElementById('size').value = order.size;
    document.getElementById('vehicleNumber').value = order.vehicleNumber;

    editIndex = index;

    // Scroll to top after editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteOrder(index) {
    // Display confirmation alert
    const confirmDelete = confirm("Are you sure you want to delete this order?");

    // If the user confirms deletion
    if (confirmDelete) {
        let orders = loadOrders();
        orders.splice(index, 1); // Remove the order at the specified index
        saveOrders(orders);
        displayOrders(orders); // Refresh the displayed orders
    }
    // If the user cancels, do nothing
}


// Initialize the display
document.getElementById('orderForm').addEventListener('submit', submitOrder);
displayOrders(loadOrders());