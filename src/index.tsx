import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import SettlementsPage from './pages/settlement.page';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
	{
		path: '/print',
		element: <App />,
	},
	{
		path: '/settlement',
		element: <SettlementsPage />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
