export interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
}

export interface Product {
    _id: string;
    name: string;
    image: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    numReviews: number;
    reviews?: Review[];
}

export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
}

export interface CartItem extends Product {
    qty: number;
}
