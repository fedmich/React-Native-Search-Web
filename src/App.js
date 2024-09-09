import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import NetInfo from "@react-native-community/netinfo"; // to check network status

const URL_ENDPOINT = 'https://raw.githubusercontent.com/fedmich/Search-Web/main/results/web/';

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);  // Reference to the TextInput

  // Function to check network status
  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };

  // Function to fetch search results
  const fetchResults = async () => {
    const isConnected = await checkConnection();
    if (!isConnected) {
      setError('You are offline. Please check your internet connection.');
      return;
    }

    const trimmedQuery = query.trim().toLowerCase(); // Trim and lowercase the query

    if (trimmedQuery === '') {
      setError('Oops! Please enter a search term.');
      inputRef.current.focus();  // Set focus back to the TextInput
      return;
    }

    const firstLetter = trimmedQuery.charAt(0);

    try {
      const response = await axios.get(`${URL_ENDPOINT}${firstLetter}/${trimmedQuery}.json`);

      if (response.data && response.data.results && response.data.results.length > 0) {
        setResults(response.data.results);
        setError(null);  // Clear any previous errors
      } else {
        setError('No results found. Try again later.');
        setResults([]);
      }
    } catch (err) {
      setError('Couldn’t fetch results. Try again later.');
      setResults([]); // Clear results on error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web Search Engine</Text>
      <TextInput
        ref={inputRef}  // Attach ref to the TextInput
        style={styles.input}
        placeholder="Enter your query"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={fetchResults} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultTitle}>{item.t}</Text>
            <Text style={styles.resultDescription}>{item.d}</Text>
            <Text style={styles.resultURL}>{item.u}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
      />
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  resultItem: {
    backgroundColor: '#eaeaea',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 14,
    color: '#555',
  },
  resultURL: {
    fontSize: 12,
    color: 'blue',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default App;
