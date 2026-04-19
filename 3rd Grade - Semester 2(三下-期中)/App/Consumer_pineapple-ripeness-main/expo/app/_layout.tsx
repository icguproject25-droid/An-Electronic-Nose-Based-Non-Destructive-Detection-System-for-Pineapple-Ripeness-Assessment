import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SensorProvider } from '@/contexts/SensorContext';
import { UploadQueueProvider } from '@/contexts/UploadQueueContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { TriviaProvider } from '@/contexts/TriviaContext';
import { Colors } from '@/constants/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SensorProvider>
          <UploadQueueProvider>
            <HistoryProvider>
              <TriviaProvider>
                <StatusBar style="dark" />
                <RootLayoutNav />
              </TriviaProvider>
            </HistoryProvider>
          </UploadQueueProvider>
        </SensorProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.warmWhite },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="instruction" />
      <Stack.Screen 
        name="processing" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="result" 
        options={{ 
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen name="pending-uploads" />
      <Stack.Screen name="history" />
      <Stack.Screen name="history-detail" />
      <Stack.Screen name="varieties" />
      <Stack.Screen name="variety-detail" />
      <Stack.Screen name="trivia" />
      <Stack.Screen name="knowledge-base" />
      <Stack.Screen name="seasonal-guide" />
      <Stack.Screen name="calculator" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
