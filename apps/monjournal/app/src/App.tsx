import { Box, Button, Text } from '@primer/react';
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Text as="h1" fontSize={6} fontWeight="bold" mb={4}>
        Mon Journal Personnel
      </Text>
      <Text as="p" fontSize={3} mb={4}>
        Bienvenue ! Commence à documenter tes pensées.
      </Text>
      <Button onClick={() => setCount(count + 1)}>
        Compte: {count}
      </Button>
      <Text as="p" fontSize={1} color="fg.muted" mt={4}>
        Vite + React + Primer = Production-Ready
      </Text>
    </Box>
  );
}
