async function placeOrder(addressId, paymentMethodId, notes, newAddress = null) {
    try {
        const requestData = {
            payment_method_id: paymentMethodId,
            notes: notes || ''
        };

        if (newAddress) {
            requestData.new_address = newAddress;
        } else if (addressId) {
            requestData.address_id = addressId;
        } else {
            throw new Error("Address is required");
        }

        const response = await fetch('php/place_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to place order');
        }

        // Order placed successfully, now process payment
        return await processPayment(data.order_id, data.txn_reference, paymentMethodId);

    } catch (error) {
        console.error('Error placing order:', error);
        return {
            success: false,
            message: error.message || 'An error occurred while placing your order'
        };
    }
}

async function processPayment(orderId, txnReference, paymentMethodId) {
    try {
        const response = await fetch('php/process_payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderId,
                txn_reference: txnReference,
                payment_method_id: paymentMethodId
            })
        });

        const data = await response.json();
        
        return {
            success: data.success,
            message: data.message || (data.success ? 'Payment successful!' : 'Payment failed'),
            order_id: data.order_id,
            status: data.status
        };

    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            message: 'An error occurred while processing your payment'
        };
    }
}