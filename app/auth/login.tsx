import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "react-native-vector-icons";
import { AuthContext } from "@/services/authentication/authContext";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  // Handle login form submission
  const handleLogin = async () => {
    if (!username || !password) {
      ToastAndroid.show("Please fill in both username and password.", ToastAndroid.BOTTOM);
      return;
    }
  
    setLoading(true);
  
    try {
      const userData = await signIn(username, password); // Calls signIn in AuthContext
  
      // Redirect to dispatcher screen
      router.push("/(tabs)/dispatch");
      console.log("Successfully Logged In:", userData);
    } catch (error) {
      ToastAndroid.show("Invalid credentials, please try again.", ToastAndroid.BOTTOM);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* LinearGradient Background */}
      <LinearGradient
        colors={["#f9fbff", "#ecfae6", "#c5d5f9", "#9a92ff"]}
        style={styles.gradientBackground}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require("../../assets/images/catranco_logo.png")}
          />
        </View>

        {/* Fill-up Form */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                  placeholder="Username"
                  placeholderTextColor="gray"
                  style={styles.input}
                  value={username} // Set the username state
                  onChangeText={(text) => setUsername(text)} // Update state on change
                />
              </View>
            <View style={styles.inputWrapper}>
              <TextInput
                  placeholder="Password"
                  placeholderTextColor="gray"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password} // Set the password state
                  onChangeText={(text) => setPassword(text)} // Update state on change
                />

                {/* Eye Icon */}
                <TouchableOpacity
                  style={styles.eyeIconWrapper}
                  onPress={() => setShowPassword(!showPassword)} // Toggle showPassword state
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButtonWrapper}
              onPress={handleLogin} // Call handleLogin function
              disabled={loading} // Disable button when loading
            >
              <LinearGradient
                colors={["#3b82f6", "#ef4444"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Logging In..." : "Login"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradientBackground: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logo: {
    height: height * 0.25,
    width: width * 0.7,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    alignItems: "center",
  },
  formContainer: {
    marginTop: height * 0.05,
    width: "100%",
  },
  inputWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: "#000",
    width: "85%", 
  },
  eyeIconWrapper: {
    padding: 8,
  },
  loginButtonWrapper: {
    width: "100%",
    marginTop: 8,
  },
  loginButton: {
    height: height * 0.075,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  createAccountButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "bold",
  },
  testButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  testButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "bold",
  },
});

export default LoginScreen;
