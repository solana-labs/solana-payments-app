import { API_ENDPOINTS } from '@/lib/endpoints';
import { twMerge } from 'tailwind-merge';
import { cookies } from 'next/headers';

interface Props {
    className?: string;
}

// TODO: Implement the sign in flow
export function ShopifySignIn(props: Props) {
    async function handleClick() {
        try {
            // const response = await fetch(API_ENDPOINTS.login);
            const response = fetch(API_ENDPOINTS.login, {
                method: 'GET',
                credentials: 'include', // include cookies in this request
            });

            console.log(API_ENDPOINTS.login);

            console.log('1');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('2', response);

            const data = response.headers;

            console.log('3', data);
            // console.log('4', response.cookies);
            // If the server sends a cookie in the response body.
            if (data.cookie) {
                cookies.set('myCookie', data.cookie);
            }

            console.log('Login successful.');
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    return (
        <>
            {' '}
            <button
                className={twMerge(
                    'border-gray-300',
                    'border',
                    'font-semibold',
                    'h-11',
                    'rounded-lg',
                    'text-slate-700',
                    props.className
                )}
            >
                Sign in with Shopify
            </button>
            <button
                className={twMerge(
                    'border-gray-300',
                    'border',
                    'font-semibold',
                    'h-11',
                    'rounded-lg',
                    'text-slate-700',
                    props.className
                )}
                onClick={handleClick}
            >
                Temporary Login
            </button>
        </>
    );
}
