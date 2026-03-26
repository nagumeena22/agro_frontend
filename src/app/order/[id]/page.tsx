'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { CheckCircle2, Clock, Banknote, CreditCard, Smartphone, Package, Truck, MapPin, CheckCircle } from 'lucide-react';

interface OrderItem {
    product: Product;
    name: string;
    image: string;
    price: number;
    qty: number;
}

interface Order {
    _id: string;
    orderItems: OrderItem[];
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    paymentResult?: {
        id: string;
        status: string;
    };
    isPaid: boolean;
    paidAt?: string;
    isConfirmed: boolean;
    confirmedAt?: string;
    isShipped: boolean;
    shippedAt?: string;
    isOutForDelivery: boolean;
    outForDeliveryAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    createdAt: string;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [utr, setUtr] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!user) return;
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                setError('Error fetching order');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user]);

    const handlePaymentPaid = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    id: 'manual_payment_' + Date.now(),
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: user?.email || '',
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
            } else {
                alert('Payment update failed');
            }
        } catch (error) {
            console.error('Payment error', error);
            alert('Payment error');
        }
    };

    const handleSubmitUTR = async () => {
        if (!utr || utr.length < 12) {
            alert('Please enter a valid 12-digit UTR number');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/submit-utr`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ utr })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
            } else {
                alert('UTR submission failed');
            }
        } catch (error) {
            console.error('UTR submission error', error);
            alert('UTR submission error');
        }
    };

    const OrderTracking = ({ order }: { order: Order }) => {
        const steps = [
            { 
                label: 'Order Placed', 
                date: order.createdAt, 
                isDone: true, 
                icon: Package,
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            },
            { 
                label: 'Confirmed', 
                date: order.confirmedAt, 
                isDone: order.isConfirmed, 
                icon: CheckCircle2,
                color: order.isConfirmed ? 'text-blue-600' : 'text-gray-400',
                bgColor: order.isConfirmed ? 'bg-blue-100' : 'bg-gray-100'
            },
            { 
                label: 'Shipped', 
                date: order.shippedAt, 
                isDone: order.isShipped, 
                icon: Truck,
                color: order.isShipped ? 'text-indigo-600' : 'text-gray-400',
                bgColor: order.isShipped ? 'bg-indigo-100' : 'bg-gray-100'
            },
            { 
                label: 'Out For Delivery', 
                date: order.outForDeliveryAt, 
                isDone: order.isOutForDelivery, 
                icon: MapPin,
                color: order.isOutForDelivery ? 'text-orange-600' : 'text-gray-400',
                bgColor: order.isOutForDelivery ? 'bg-orange-100' : 'bg-gray-100'
            },
            { 
                label: 'Delivered', 
                date: order.deliveredAt, 
                isDone: order.isDelivered, 
                icon: CheckCircle,
                color: order.isDelivered ? 'text-green-700' : 'text-gray-400',
                bgColor: order.isDelivered ? 'bg-green-100' : 'bg-gray-100'
            }
        ];

        return (
            <div className="w-full py-8 px-4 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex items-center justify-between max-w-3xl mx-auto">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
                    
                    {/* Active Progress Line */}
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-green-500 transition-all duration-500 -z-0"
                        style={{ 
                            width: `${(steps.filter(s => s.isDone).length - 1) * 25}%` 
                        }}
                    ></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center group z-10 bg-white px-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${step.bgColor} ${step.color} ${step.isDone ? 'ring-4 ring-white shadow-md' : 'border-2 border-gray-200'}`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            
                            <div className="absolute top-14 flex flex-col items-center w-32">
                                <span className={`text-xs font-bold text-center leading-tight mb-1 ${step.isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                                {step.isDone && step.date && (
                                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                        {new Date(step.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(step.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-10"></div> {/* Spacer for tooltips/absolute labels */}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Order tracking: <span className="text-green-700">{order._id}</span></h1>
            
            <OrderTracking order={order} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="bg-white p-6 rounded shadow mb-4">
                        <h2 className="text-xl font-semibold mb-2">Shipping</h2>
                        <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                        {order.isDelivered ? (
                            <div className="mt-2 bg-green-100 text-green-800 p-2 rounded">Delivered</div>
                        ) : (
                            <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded">Not Delivered</div>
                        )}
                        {order.isConfirmed ? (
                            <div className="mt-2 bg-blue-100 text-blue-800 p-2 rounded">Confirmed by Admin</div>
                        ) : (
                            <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded">Pending Confirmation</div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded shadow mb-4">
                        <h2 className="text-xl font-semibold mb-4">Payment Info</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2"><strong>Method:</strong> <span className="font-medium text-gray-800">{order.paymentMethod}</span></p>
                                
                                {order.isPaid ? (
                                    <div className="inline-flex items-center mt-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Paid ✅
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center mt-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <Clock className="w-4 h-4 mr-1.5" /> Pending ⏳
                                    </div>
                                )}
                            </div>

                            {!order.isPaid && (
                                <div className="mt-6 border-t pt-4">
                                    {order.paymentMethod === 'Credit Card / PayPal' && (
                                        <div className="flex flex-col p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex items-center mb-4">
                                                <CreditCard className="w-6 h-6 text-green-700 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-800">Secure Card Payment</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Amount due: <span className="font-bold text-green-700 text-lg">${order.totalPrice.toFixed(2)}</span>
                                            </p>

                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                    <input type="text" placeholder="**** **** **** ****" className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                        <input type="text" placeholder="MM/YY" className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                                        <input type="text" placeholder="***" className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                                    <input type="text" placeholder="Name on card" className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white" />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handlePaymentPaid}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-all shadow-md flex items-center justify-center gap-2"
                                            >
                                                <span>Pay Now</span>
                                                <span className="bg-green-800 bg-opacity-30 rounded px-2 py-0.5 text-xs font-mono ml-2">
                                                    ${order.totalPrice.toFixed(2)}
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                    {order.paymentMethod === 'UPI' && (
                                        <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-center w-full mb-4 pb-4 border-b border-gray-100">
                                                <Smartphone className="w-6 h-6 text-blue-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-800">Scan & Pay via UPI</h3>
                                            </div>
                                            
                                            {order.paymentResult?.status === 'PENDING_VERIFICATION' ? (
                                                <div className="text-center w-full py-4 space-y-3">
                                                    <Clock className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
                                                    <h4 className="text-lg font-medium text-gray-800">Verification Pending</h4>
                                                    <p className="text-sm text-gray-600">Your UTR <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{order.paymentResult.id}</span> has been submitted.</p>
                                                    <p className="text-sm text-gray-600">The shop admin will verify the transfer shortly to confirm your order.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-gray-600 mb-2 text-center">
                                                        Amount due: <span className="font-bold text-green-700 text-lg">${order.totalPrice.toFixed(2)}</span>
                                                    </p>
                                                    
                                                    <p className="text-sm font-bold text-gray-800 bg-gray-100 px-4 py-1.5 rounded-full mb-6">
                                                        lakshmiagro@upi
                                                    </p>
                                                    
                                                    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 mb-6 bg-gradient-to-br from-gray-50 to-gray-100">
                                                        <img 
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=LakshmiAgro%20Payment%20${order.totalPrice.toFixed(2)}`} 
                                                            alt="UPI Payment QR Code" 
                                                            className="w-40 h-40 mix-blend-multiply"
                                                        />
                                                    </div>

                                                    <div className="w-full max-w-sm space-y-3">
                                                        <label className="block text-sm font-medium text-gray-700 text-left">Enter 12-digit UTR/Transaction ID</label>
                                                        <input 
                                                            type="text" 
                                                            value={utr}
                                                            onChange={(e) => setUtr(e.target.value)}
                                                            placeholder="e.g. 123456789012" 
                                                            className="w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-center tracking-widest font-mono"
                                                        />
                                                        
                                                        <button 
                                                            onClick={handleSubmitUTR}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-all shadow-md transform hover:-translate-y-0.5"
                                                        >
                                                            Submit UTR
                                                        </button>
                                                        <p className="text-xs text-gray-500 mt-2 text-center">Submit this after transferring funds via your UPI app.</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {order.paymentMethod === 'COD' && (
                                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                            <p className="flex items-center font-medium">
                                                <Banknote className="w-5 h-5 mr-2" />
                                                Payment will be collected on delivery.
                                            </p>
                                            <p className="text-sm mt-1 text-blue-600">Please keep exact change ready.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Order Items</h2>
                        {order.orderItems.length === 0 ? <p>Order is empty</p> : (
                            <ul className="divide-y divide-gray-200">
                                {order.orderItems.map((item, index) => (
                                    <li key={index} className="py-2 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <img src={item.image || 'https://placehold.co/50'} alt={item.name} className="h-10 w-10 object-cover rounded mr-2" />
                                            <span>{item.name}</span>
                                        </div>
                                        <span>{item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Items</span>
                            <span>${(order.itemsPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping</span>
                            <span>${(order.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Tax</span>
                            <span>${(order.taxPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 font-bold border-t pt-2">
                            <span>Total</span>
                            <span>${(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
